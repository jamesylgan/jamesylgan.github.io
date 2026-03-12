package tech.bellevue.tripplanner;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.webkit.WebViewAssetLoader;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
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

    private WebView webView;
    private WebViewAssetLoader assetLoader;
    private TileCache tileCache;
    private boolean pageLoaded = false;
    private String pendingTripJson = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        tileCache = new TileCache(this);

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
        // Allow file access so file:// intents can be read
        ws.setAllowFileAccess(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view,
                    WebResourceRequest request) {
                Uri url = request.getUrl();
                String host = url.getHost();

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
                    String path = url.getPath();

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
                injectPendingTrip();
            }
        });

        webView.setWebChromeClient(new WebChromeClient());

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

    private void handleIntent(Intent intent) {
        if (intent == null) return;

        Uri uri = intent.getData();

        // Handle ACTION_SEND (share sheet sends URI via EXTRA_STREAM)
        if (Intent.ACTION_SEND.equals(intent.getAction())) {
            uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
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

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
