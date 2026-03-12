package tech.bellevue.tripplanner;

import android.content.ContentValues;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.StatFs;
import android.provider.MediaStore;
import android.webkit.JavascriptInterface;
import android.webkit.MimeTypeMap;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.FileProvider;
import androidx.webkit.WebViewAssetLoader;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends AppCompatActivity {

    // The app always loads from bundled assets served under this origin.
    // Using the real domain means localStorage keys stay consistent if the
    // user also visits the site in a regular browser on the same device.
    private static final String LOCAL_URL = "https://bellevue.tech/tools/trip-planner/";

    // Matches tile URLs like /z/x/y.png from OpenStreetMap tile servers
    private static final Pattern TILE_PATTERN =
            Pattern.compile("/(\\d+)/(\\d+)/(\\d+)\\.png$");

    // Matches offline vector tile requests: /offline-tiles/{z}/{x}/{y}.mvt
    private static final Pattern OFFLINE_TILE_PATTERN =
            Pattern.compile("/tools/trip-planner/offline-tiles/(\\d+)/(\\d+)/(\\d+)\\.mvt$");

    // Matches PMTiles file requests: /offline-pmtiles/<filename>.pmtiles
    private static final Pattern PMTILES_FILE_PATTERN =
            Pattern.compile("/tools/trip-planner/offline-pmtiles/(.+\\.pmtiles)$");

    private static final String PREFS_NAME = "trip_planner_prefs";
    private static final String PREF_MAP_REPOS = "map_repos"; // JSON array of repo URLs
    private static final String PREF_CONFIG_PREFIX = "repo_config_"; // cached config per repo
    private static final String PREF_ASSETS_PREFIX = "repo_assets_"; // cached release asset names per repo

    private WebView webView;
    private WebViewAssetLoader assetLoader;
    private TileCache tileCache;
    private OfflineMapStore offlineMapStore;
    private PMTilesDownloader downloader;
    private boolean pageLoaded = false;
    private String pendingTripJson = null;

    // For WebView file chooser (import)
    private ValueCallback<Uri[]> fileChooserCallback;

    // For file saving (export) via ACTION_CREATE_DOCUMENT
    private String pendingSaveContent;
    private String pendingSaveFilename;

    // Activity result launchers
    private ActivityResultLauncher<Intent> fileChooserLauncher;
    private ActivityResultLauncher<Intent> saveFileLauncher;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Register activity result launchers before any other setup
        fileChooserLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(), result -> {
                    if (fileChooserCallback == null) return;
                    Uri[] results = null;
                    if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                        Uri uri = result.getData().getData();
                        if (uri != null) results = new Uri[]{uri};
                    }
                    fileChooserCallback.onReceiveValue(results);
                    fileChooserCallback = null;
                });

        saveFileLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(), result -> {
                    if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                        Uri uri = result.getData().getData();
                        if (uri != null && pendingSaveContent != null) {
                            writeSaveContent(uri);
                        }
                    }
                    pendingSaveContent = null;
                    pendingSaveFilename = null;
                });

        webView = findViewById(R.id.webview);
        tileCache = new TileCache(this);
        offlineMapStore = new OfflineMapStore(this);
        downloader = new PMTilesDownloader(offlineMapStore, webView);

        // WebViewAssetLoader serves files from assets/ under the https://
        // bellevue.tech origin.  This gives us:
        //  - Instant offline loading (no network round-trip)
        //  - Same-origin localStorage (consistent with the hosted PWA)
        //  - Service worker registration works (requires https)
        assetLoader = new WebViewAssetLoader.Builder()
                .setDomain("bellevue.tech")
                .addPathHandler("/tools/trip-planner/",
                        new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setDatabaseEnabled(true);
        // LOAD_NO_CACHE: the web app is fully bundled, no network needed for it.
        // Map tiles go through our own tile-caching interceptor.
        ws.setCacheMode(WebSettings.LOAD_NO_CACHE);
        ws.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        // .trip file imports use ContentResolver.openInputStream() in Java, then
        // inject the JSON via evaluateJavascript(). The WebView itself never loads
        // file:// URLs, so disabling file access here is safe and reduces attack surface.
        ws.setAllowFileAccess(false);

        // Register JavaScript interface for offline maps and Android-specific features
        webView.addJavascriptInterface(new AndroidNative(), "AndroidNative");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view,
                    WebResourceRequest request) {
                Uri url = request.getUrl();
                String host = url.getHost();
                String path = url.getPath();

                // --- PMTiles file serving (Range requests) ---
                // Serve .pmtiles files with Range request support for protomaps-leaflet.
                if ("bellevue.tech".equals(host) && path != null) {
                    Matcher pmtilesMatcher = PMTILES_FILE_PATTERN.matcher(path);
                    if (pmtilesMatcher.find()) {
                        return servePmtilesFile(pmtilesMatcher.group(1), request);
                    }
                }

                // --- Offline vector tiles ---
                // Intercept /offline-tiles/{z}/{x}/{y}.mvt requests and serve from SQLite.
                // Must be checked BEFORE the asset loader so it doesn't get caught by it.
                if ("bellevue.tech".equals(host) && path != null) {
                    Matcher offlineMatcher = OFFLINE_TILE_PATTERN.matcher(path);
                    if (offlineMatcher.find()) {
                        return serveOfflineTile(offlineMatcher);
                    }
                }

                // --- OSM tile caching ---
                // Intercept tile requests: serve from cache, or fetch+cache,
                // or return stale cache on network failure.
                if (host != null && host.contains("tile.openstreetmap.org")) {
                    WebResourceResponse cached = serveTileFromCache(url);
                    if (cached != null) return cached;
                    return fetchAndCacheTile(url);
                }

                // --- Bundled web app ---
                // All requests to bellevue.tech/tools/trip-planner/* are served
                // from the APK's assets/ directory.
                if ("bellevue.tech".equals(host)) {
                    // Map directory URL to index.html
                    if (path != null && (path.equals("/tools/trip-planner/")
                            || path.equals("/tools/trip-planner"))) {
                        Uri indexUrl = url.buildUpon()
                                .path("/tools/trip-planner/index.html").build();
                        return assetLoader.shouldInterceptRequest(indexUrl);
                    }

                    return assetLoader.shouldInterceptRequest(url);
                }

                return null;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                pageLoaded = true;
                // Inject Android app flag and re-render so Android-only UI appears
                view.evaluateJavascript(
                    "window.__ANDROID_APP__ = true; window.__APP_VERSION__ = '1.2';"
                    + "if(typeof render==='function')render();", null);
                injectPendingTrip();
            }
        });

        // WebChromeClient with file chooser support for <input type="file">
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView,
                    ValueCallback<Uri[]> callback,
                    FileChooserParams fileChooserParams) {
                // Cancel any pending callback
                if (fileChooserCallback != null) {
                    fileChooserCallback.onReceiveValue(null);
                }
                fileChooserCallback = callback;

                Intent intent = fileChooserParams.createIntent();
                try {
                    fileChooserLauncher.launch(intent);
                } catch (Exception e) {
                    fileChooserCallback = null;
                    callback.onReceiveValue(null);
                    return false;
                }
                return true;
            }
        });

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });

        handleIntent(getIntent());

        // Load from bundled assets (served under https:// by WebViewAssetLoader).
        // Works instantly, no network required.
        webView.loadUrl(LOCAL_URL);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleIntent(intent);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (downloader != null) {
            downloader.shutdown();
        }
        if (offlineMapStore != null) {
            offlineMapStore.closeAllReaders();
        }
    }

    // --- JavaScript Interface ---

    /**
     * Exposed to JavaScript as window.AndroidNative.
     * All methods are called from the WebView JS thread.
     */
    class AndroidNative {

        // --- File operations ---

        /**
         * Save text content to a file using the system file picker.
         * Called from JS when the user exports a trip, calendar, GPX, etc.
         */
        @JavascriptInterface
        public void saveFile(String content, String filename, String mimeType) {
            pendingSaveContent = content;
            pendingSaveFilename = filename;
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType(mimeType != null ? mimeType : "application/octet-stream");
            intent.putExtra(Intent.EXTRA_TITLE, filename);
            runOnUiThread(() -> saveFileLauncher.launch(intent));
        }

        /**
         * Share text content as a file via the Android share sheet.
         */
        @JavascriptInterface
        public void shareFile(String content, String filename, String mimeType) {
            try {
                // Write to cache dir (no permissions needed)
                File cacheDir = new File(getCacheDir(), "shared");
                cacheDir.mkdirs();
                File file = new File(cacheDir, filename);
                FileOutputStream fos = new FileOutputStream(file);
                fos.write(content.getBytes("UTF-8"));
                fos.close();

                Uri uri = FileProvider.getUriForFile(
                        MainActivity.this,
                        "tech.bellevue.tripplanner.fileprovider",
                        file);

                Intent shareIntent = new Intent(Intent.ACTION_SEND);
                shareIntent.setType(mimeType != null ? mimeType : "application/octet-stream");
                shareIntent.putExtra(Intent.EXTRA_STREAM, uri);
                shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                startActivity(Intent.createChooser(shareIntent, "Share " + filename));
            } catch (IOException e) {
                runOnUiThread(() -> Toast.makeText(
                        MainActivity.this, "Share failed", Toast.LENGTH_SHORT).show());
            }
        }

        // --- Offline maps: Repo management ---

        /** Get list of configured map repo URLs. */
        @JavascriptInterface
        public String getMapRepos() {
            return getMapReposList().toString();
        }

        /** Add a map repo URL. Returns the config JSON or error. */
        @JavascriptInterface
        public void addMapRepo(String repoUrl) {
            org.json.JSONArray repos = getMapReposList();
            // Check for duplicates
            for (int i = 0; i < repos.length(); i++) {
                try { if (repoUrl.equals(repos.getString(i))) return; } catch (JSONException e) {}
            }
            repos.put(repoUrl);
            saveMapRepos(repos);
        }

        /** Remove a map repo URL. Keeps cached config until all its maps are deleted. */
        @JavascriptInterface
        public void removeMapRepo(String repoUrl) {
            org.json.JSONArray repos = getMapReposList();
            org.json.JSONArray updated = new org.json.JSONArray();
            for (int i = 0; i < repos.length(); i++) {
                try {
                    String r = repos.getString(i);
                    if (!repoUrl.equals(r)) updated.put(r);
                } catch (JSONException e) {}
            }
            saveMapRepos(updated);
            // Don't clear cached config here — keep it so we can still
            // render downloaded maps in the Manage tab. Config is cleared
            // only when all maps from this repo are deleted.
        }

        /** Clear cached config for a repo (call when all its maps are deleted). */
        @JavascriptInterface
        public void clearCachedConfig(String repoSlug) {
            String slugKey = repoSlug.replace("/", "_");
            getSharedPreferences(PREFS_NAME, MODE_PRIVATE).edit()
                    .remove(PREF_CONFIG_PREFIX + slugKey)
                    .remove(PREF_ASSETS_PREFIX + slugKey)
                    .apply();
        }

        /**
         * Fetch config.json from a GitHub repo. Caches on success;
         * returns cached version on network failure (works offline).
         */
        @JavascriptInterface
        public String fetchRepoConfig(String repoSlug) {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            String cacheKey = PREF_CONFIG_PREFIX + repoSlug.replace("/", "_");

            try {
                // Fetch raw config.json from GitHub
                String url = "https://raw.githubusercontent.com/" + repoSlug + "/main/config.json";
                HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
                conn.setRequestProperty("User-Agent", "TripPlanner/1.0");
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(15000);

                int code = conn.getResponseCode();
                if (code != 200) {
                    conn.disconnect();
                    // Fall back to cached config
                    String cached = prefs.getString(cacheKey, null);
                    if (cached != null) return cached;
                    return "{\"error\":\"HTTP " + code + "\"}";
                }

                InputStream is = conn.getInputStream();
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                byte[] buf = new byte[8192];
                int n;
                while ((n = is.read(buf)) != -1) baos.write(buf, 0, n);
                is.close();
                conn.disconnect();

                String json = baos.toString("UTF-8");
                // Cache for offline use
                prefs.edit().putString(cacheKey, json).apply();
                return json;
            } catch (IOException e) {
                // Network failed — return cached config if available
                String cached = prefs.getString(cacheKey, null);
                if (cached != null) return cached;
                return "{\"error\":\"" + e.getMessage().replace("\"", "'") + "\"}";
            }
        }

        /** Get cached config (no network). Returns null if not cached. */
        @JavascriptInterface
        public String getCachedRepoConfig(String repoSlug) {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            String cacheKey = PREF_CONFIG_PREFIX + repoSlug.replace("/", "_");
            return prefs.getString(cacheKey, null);
        }

        /**
         * Fetch release asset filenames from a GitHub repo's latest release.
         * Caches on success; returns cached version on network failure.
         */
        @JavascriptInterface
        public String fetchReleaseAssets(String repoSlug) {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            String cacheKey = PREF_ASSETS_PREFIX + repoSlug.replace("/", "_");

            try {
                String url = "https://api.github.com/repos/" + repoSlug + "/releases/latest";
                HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
                conn.setRequestProperty("User-Agent", "TripPlanner/1.0");
                conn.setRequestProperty("Accept", "application/vnd.github+json");
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(15000);

                int code = conn.getResponseCode();
                if (code != 200) {
                    conn.disconnect();
                    String cached = prefs.getString(cacheKey, null);
                    return cached != null ? cached : "[]";
                }

                InputStream is = conn.getInputStream();
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                byte[] buf = new byte[8192];
                int n;
                while ((n = is.read(buf)) != -1) baos.write(buf, 0, n);
                is.close();
                conn.disconnect();

                // Parse release JSON, extract asset filenames
                JSONObject release = new JSONObject(baos.toString("UTF-8"));
                org.json.JSONArray assets = release.optJSONArray("assets");
                org.json.JSONArray names = new org.json.JSONArray();
                if (assets != null) {
                    for (int i = 0; i < assets.length(); i++) {
                        JSONObject asset = assets.getJSONObject(i);
                        names.put(asset.getString("name"));
                    }
                }

                String result = names.toString();
                prefs.edit().putString(cacheKey, result).apply();
                return result;
            } catch (Exception e) {
                String cached = prefs.getString(cacheKey, null);
                return cached != null ? cached : "[]";
            }
        }

        /** Get cached release asset filenames (no network). Returns null if not cached. */
        @JavascriptInterface
        public String getCachedReleaseAssets(String repoSlug) {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            String cacheKey = PREF_ASSETS_PREFIX + repoSlug.replace("/", "_");
            return prefs.getString(cacheKey, null);
        }

        // --- Offline maps: Downloads ---

        /**
         * Download a PMTiles file from a GitHub release.
         * @param id       Region ID (e.g. "spain--andalusia--seville")
         * @param name     Display name
         * @param country  Country key for grouping
         * @param repoSlug GitHub repo (e.g. "jamesylgan/Spain-pmtiles")
         * @param filename Release asset filename (e.g. "spain--andalusia--seville.pmtiles")
         * @param west,south,east,north  Bounding box
         * @param maxZoom  Max zoom level
         * @param sizeBytes Expected file size (0 if unknown)
         */
        @JavascriptInterface
        public void downloadRegion(String id, String name, String country,
                                   String repoSlug, String filename,
                                   double west, double south, double east, double north,
                                   int maxZoom, long sizeBytes) {
            // Build download URL from latest release
            String downloadUrl = "https://github.com/" + repoSlug
                    + "/releases/latest/download/" + filename;
            OfflineRegion region = new OfflineRegion(id, name, country, repoSlug,
                    downloadUrl, west, south, east, north, maxZoom, sizeBytes);
            downloader.downloadRegion(region);
        }

        @JavascriptInterface
        public void cancelDownload(String id) {
            downloader.cancelDownload(id);
        }

        @JavascriptInterface
        public void deleteRegion(String id) {
            offlineMapStore.deleteRegion(id);
        }

        @JavascriptInterface
        public void deleteCountry(String country) {
            offlineMapStore.deleteRegionsByCountry(country);
        }

        @JavascriptInterface
        public String getRegions() {
            return offlineMapStore.getRegionsJson();
        }

        @JavascriptInterface
        public String getStorageInfo() {
            try {
                long usedBytes = offlineMapStore.getTotalStorageUsed();
                StatFs stat = new StatFs(getFilesDir().getAbsolutePath());
                long availableBytes = stat.getAvailableBytes();
                JSONObject obj = new JSONObject();
                obj.put("usedBytes", usedBytes);
                obj.put("availableBytes", availableBytes);
                return obj.toString();
            } catch (JSONException e) {
                return "{\"usedBytes\":0,\"availableBytes\":0}";
            }
        }
    }

    private org.json.JSONArray getMapReposList() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        String json = prefs.getString(PREF_MAP_REPOS, "[]");
        try {
            return new org.json.JSONArray(json);
        } catch (JSONException e) {
            return new org.json.JSONArray();
        }
    }

    private void saveMapRepos(org.json.JSONArray repos) {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        prefs.edit().putString(PREF_MAP_REPOS, repos.toString()).apply();
    }

    /**
     * Write pending save content to the URI returned by ACTION_CREATE_DOCUMENT.
     */
    private void writeSaveContent(Uri uri) {
        try {
            OutputStream os = getContentResolver().openOutputStream(uri);
            if (os != null) {
                os.write(pendingSaveContent.getBytes("UTF-8"));
                os.close();
                runOnUiThread(() -> Toast.makeText(
                        this, "Saved " + pendingSaveFilename, Toast.LENGTH_SHORT).show());
            }
        } catch (IOException e) {
            runOnUiThread(() -> Toast.makeText(
                    this, "Save failed", Toast.LENGTH_SHORT).show());
        }
    }

    // --- PMTiles file serving (Range requests) ---

    /**
     * Serve a .pmtiles file with Range request support.
     * Files are resolved from:
     *  - "world-overview.pmtiles" → extracted asset in filesDir
     *  - anything else → offline_maps directory
     */
    private WebResourceResponse servePmtilesFile(String filename, WebResourceRequest request) {
        try {
            File file;
            if ("world-overview.pmtiles".equals(filename)) {
                // Ensure world basemap is extracted from assets
                file = new File(getFilesDir(), "world-overview.pmtiles");
                if (!file.exists()) {
                    InputStream assetIs = getAssets().open("world-overview.pmtiles");
                    FileOutputStream fos = new FileOutputStream(file);
                    byte[] buf = new byte[8192];
                    int n;
                    while ((n = assetIs.read(buf)) != -1) fos.write(buf, 0, n);
                    fos.close();
                    assetIs.close();
                }
            } else {
                file = new File(offlineMapStore.getMapsDir(), filename);
            }

            if (!file.exists()) {
                return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                        java.util.Collections.emptyMap(),
                        new ByteArrayInputStream("File not found".getBytes()));
            }

            long fileLength = file.length();

            // Check for Range header
            java.util.Map<String, String> reqHeaders = request.getRequestHeaders();
            String rangeHeader = reqHeaders != null ? reqHeaders.get("Range") : null;
            if (rangeHeader == null && reqHeaders != null) {
                rangeHeader = reqHeaders.get("range");
            }

            java.util.Map<String, String> responseHeaders = new java.util.HashMap<>();
            responseHeaders.put("Accept-Ranges", "bytes");
            responseHeaders.put("Access-Control-Allow-Origin", "*");
            responseHeaders.put("Content-Type", "application/octet-stream");

            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                String rangeSpec = rangeHeader.substring(6);
                String[] parts = rangeSpec.split("-");
                long start = Long.parseLong(parts[0]);
                long end = parts.length > 1 && !parts[1].isEmpty()
                        ? Long.parseLong(parts[1]) : fileLength - 1;
                end = Math.min(end, fileLength - 1);
                long contentLength = end - start + 1;

                java.io.RandomAccessFile raf = new java.io.RandomAccessFile(file, "r");
                raf.seek(start);
                byte[] data = new byte[(int) contentLength];
                raf.readFully(data);
                raf.close();

                responseHeaders.put("Content-Range", "bytes " + start + "-" + end + "/" + fileLength);
                responseHeaders.put("Content-Length", String.valueOf(contentLength));

                return new WebResourceResponse("application/octet-stream", null,
                        206, "Partial Content", responseHeaders,
                        new ByteArrayInputStream(data));
            } else {
                // Full file (for HEAD requests or initial probes)
                responseHeaders.put("Content-Length", String.valueOf(fileLength));
                return new WebResourceResponse("application/octet-stream", null,
                        200, "OK", responseHeaders,
                        new java.io.FileInputStream(file));
            }
        } catch (Exception e) {
            return new WebResourceResponse("text/plain", "UTF-8", 500, "Error",
                    java.util.Collections.emptyMap(),
                    new ByteArrayInputStream(("Error: " + e.getMessage()).getBytes()));
        }
    }

    // --- Offline vector tile serving ---

    private WebResourceResponse serveOfflineTile(Matcher matcher) {
        try {
            int z = Integer.parseInt(matcher.group(1));
            int x = Integer.parseInt(matcher.group(2));
            int y = Integer.parseInt(matcher.group(3));

            byte[] data = offlineMapStore.getTile(z, x, y);
            if (data != null) {
                return new WebResourceResponse(
                        "application/x-protobuf", null,
                        new ByteArrayInputStream(data));
            }
        } catch (NumberFormatException e) {
            // Invalid tile coordinates
        }

        // No tile found — return 204 No Content so the raster layer shows through
        return new WebResourceResponse(
                "application/x-protobuf", null, 204, "No Content",
                java.util.Collections.emptyMap(),
                new ByteArrayInputStream(new byte[0]));
    }

    // --- Intent handling ---

    private void handleIntent(Intent intent) {
        if (intent == null) return;

        Uri uri = intent.getData();

        // Handle ACTION_SEND (share sheet sends URI via EXTRA_STREAM)
        if (Intent.ACTION_SEND.equals(intent.getAction())) {
            if (Build.VERSION.SDK_INT >= 33) {
                uri = intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri.class);
            } else {
                uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
            }
        }

        if (uri == null) return;

        try {
            String json = readUri(uri);
            if (json != null && !json.trim().isEmpty()) {
                pendingTripJson = json;
                if (pageLoaded) {
                    injectPendingTrip();
                }
            }
        } catch (Exception e) {
            Toast.makeText(this, "Failed to read trip file", Toast.LENGTH_SHORT).show();
        }
    }

    private String readUri(Uri uri) throws IOException {
        InputStream is = getContentResolver().openInputStream(uri);
        if (is == null) return null;

        BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
        StringBuilder sb = new StringBuilder();
        char[] buf = new char[8192];
        int n;
        while ((n = reader.read(buf)) != -1) {
            sb.append(buf, 0, n);
        }
        reader.close();
        return sb.toString();
    }

    private void injectPendingTrip() {
        if (pendingTripJson == null) return;

        // Escape for JavaScript single-quoted string literal
        String escaped = pendingTripJson
                .replace("\\", "\\\\")
                .replace("'", "\\'")
                .replace("\n", "\\n")
                .replace("\r", "\\r");

        webView.evaluateJavascript(
                "window.importTripFromAndroid('" + escaped + "')", null);

        pendingTripJson = null;
    }

    // --- OSM tile caching helpers ---

    private int[] parseTileCoords(Uri url) {
        String path = url.getPath();
        if (path == null) return null;
        Matcher m = TILE_PATTERN.matcher(path);
        if (!m.find()) return null;
        return new int[]{
                Integer.parseInt(m.group(1)),  // z
                Integer.parseInt(m.group(2)),  // x
                Integer.parseInt(m.group(3))   // y
        };
    }

    private WebResourceResponse serveTileFromCache(Uri url) {
        int[] zxy = parseTileCoords(url);
        if (zxy == null) return null;
        byte[] data = tileCache.getTile(zxy[0], zxy[1], zxy[2]);
        if (data == null) return null;
        return new WebResourceResponse("image/png", null,
                new ByteArrayInputStream(data));
    }

    private WebResourceResponse fetchAndCacheTile(Uri url) {
        int[] zxy = parseTileCoords(url);
        try {
            HttpURLConnection conn = (HttpURLConnection)
                    new URL(url.toString()).openConnection();
            conn.setRequestProperty("User-Agent", "TripPlanner/1.0");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(10000);

            if (conn.getResponseCode() != 200) return null;

            InputStream is = conn.getInputStream();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = is.read(buf)) != -1) baos.write(buf, 0, n);
            is.close();

            byte[] data = baos.toByteArray();

            // Cache the tile for future offline use
            if (zxy != null) {
                tileCache.putTile(zxy[0], zxy[1], zxy[2], data);
            }

            return new WebResourceResponse("image/png", null,
                    new ByteArrayInputStream(data));
        } catch (IOException e) {
            // Network failed — try cache even if expired
            if (zxy != null) {
                byte[] data = tileCache.getTile(zxy[0], zxy[1], zxy[2]);
                if (data != null) {
                    return new WebResourceResponse("image/png", null,
                            new ByteArrayInputStream(data));
                }
            }
            return null;
        }
    }

}
