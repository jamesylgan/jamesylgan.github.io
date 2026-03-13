package tech.bellevue.tripplanner;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.webkit.WebView;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

/**
 * Downloads whole PMTiles files from GitHub release URLs and stores them locally.
 *
 * Reports progress to the WebView via evaluateJavascript callbacks.
 * Uses a single-thread executor so downloads are queued sequentially.
 */
public class PMTilesDownloader {

    private static final String TAG = "PMTilesDownloader";
    private static final int PROGRESS_INTERVAL_BYTES = 100_000; // report every ~100KB

    private final OfflineMapStore store;
    private final WebView webView;
    private final Handler mainHandler;
    private final ExecutorService executor;

    private final Map<String, Future<?>> activeDownloads = new ConcurrentHashMap<>();
    private final Map<String, Boolean> cancelFlags = new ConcurrentHashMap<>();

    public PMTilesDownloader(OfflineMapStore store, WebView webView) {
        this.store = store;
        this.webView = webView;
        this.mainHandler = new Handler(Looper.getMainLooper());
        this.executor = Executors.newSingleThreadExecutor();
    }

    /**
     * Download a PMTiles file for a region.
     */
    public void downloadRegion(OfflineRegion region) {
        cancelFlags.put(region.id, false);

        region.status = "downloading";
        region.filePath = new File(store.getMapsDir(), region.id + ".pmtiles").getAbsolutePath();
        store.insertRegion(region);

        Future<?> future = executor.submit(() -> {
            try {
                downloadFile(region);
                store.updateRegionStatus(region.id, "complete");
                notifyComplete(region.id, true, null);
            } catch (IOException e) {
                Log.e(TAG, "Download failed for " + region.id, e);
                store.updateRegionStatus(region.id, "failed");
                // Clean up partial file
                if (region.filePath != null) {
                    new File(region.filePath).delete();
                }
                notifyComplete(region.id, false, e.getMessage());
            } finally {
                activeDownloads.remove(region.id);
                cancelFlags.remove(region.id);
            }
        });

        activeDownloads.put(region.id, future);
    }

    public void cancelDownload(String regionId) {
        cancelFlags.put(regionId, true);
        Future<?> future = activeDownloads.get(regionId);
        if (future != null) {
            future.cancel(false);
        }
        store.updateRegionStatus(regionId, "failed");
    }

    private void downloadFile(OfflineRegion region) throws IOException {
        String downloadUrl = region.downloadUrl;
        if (downloadUrl == null || downloadUrl.isEmpty()) {
            throw new IOException("No download URL for region " + region.id);
        }

        // Follow redirects (GitHub releases redirect to CDN)
        HttpURLConnection conn = openConnection(downloadUrl);
        int code = conn.getResponseCode();
        if (code != 200) {
            conn.disconnect();
            throw new IOException("HTTP " + code + " downloading " + region.id);
        }

        long totalBytes = conn.getContentLengthLong();
        if (totalBytes > 0) {
            region.sizeBytes = totalBytes;
            store.insertRegion(region); // update size
        }

        File outFile = new File(region.filePath);
        InputStream is = conn.getInputStream();
        FileOutputStream fos = new FileOutputStream(outFile);

        byte[] buf = new byte[8192];
        long downloaded = 0;
        long lastProgress = 0;
        int n;

        while ((n = is.read(buf)) != -1) {
            if (isCancelled(region.id)) {
                fos.close();
                is.close();
                conn.disconnect();
                outFile.delete();
                return;
            }
            fos.write(buf, 0, n);
            downloaded += n;

            if (downloaded - lastProgress >= PROGRESS_INTERVAL_BYTES) {
                store.updateDownloadProgress(region.id, downloaded);
                notifyProgress(region.id, downloaded, totalBytes > 0 ? totalBytes : region.sizeBytes);
                lastProgress = downloaded;
            }
        }

        fos.close();
        is.close();
        conn.disconnect();

        // Final update with actual file size
        long actualSize = outFile.length();
        store.updateFilePath(region.id, region.filePath, actualSize);
        notifyProgress(region.id, actualSize, actualSize);
    }

    private HttpURLConnection openConnection(String urlStr) throws IOException {
        int redirects = 0;
        while (redirects < 5) {
            HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
            conn.setRequestProperty("User-Agent", "TripPlanner/1.0");
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(60000);
            conn.setInstanceFollowRedirects(false);

            int code = conn.getResponseCode();
            if (code == 301 || code == 302 || code == 307 || code == 308) {
                String location = conn.getHeaderField("Location");
                conn.disconnect();
                if (location == null) throw new IOException("Redirect with no Location header");
                urlStr = location;
                redirects++;
                continue;
            }
            return conn;
        }
        throw new IOException("Too many redirects");
    }

    private boolean isCancelled(String regionId) {
        Boolean flag = cancelFlags.get(regionId);
        return flag != null && flag;
    }

    // --- WebView callbacks ---

    private static String sanitizeId(String id) {
        // Allow alphanumeric, hyphens, underscores (region IDs use -- separators)
        return id.replaceAll("[^a-zA-Z0-9_\\-]", "");
    }

    private void notifyProgress(String regionId, long downloaded, long total) {
        String safeId = sanitizeId(regionId);
        mainHandler.post(() -> {
            String js = "if(window.__onDownloadProgress)window.__onDownloadProgress('"
                    + safeId + "'," + downloaded + "," + total + ")";
            webView.evaluateJavascript(js, null);
        });
    }

    private void notifyComplete(String regionId, boolean success, String errorMsg) {
        String safeId = sanitizeId(regionId);
        String safeError = errorMsg != null
                ? "'" + errorMsg.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ") + "'"
                : "null";
        mainHandler.post(() -> {
            String js = "if(window.__onDownloadComplete)window.__onDownloadComplete('"
                    + safeId + "'," + success + "," + safeError + ")";
            webView.evaluateJavascript(js, null);
        });
    }

    public void shutdown() {
        executor.shutdownNow();
    }
}
