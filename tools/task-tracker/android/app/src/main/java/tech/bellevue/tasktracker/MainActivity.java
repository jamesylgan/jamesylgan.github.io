package tech.bellevue.tasktracker;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
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

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;

public class MainActivity extends AppCompatActivity {

    private static final String LOCAL_URL = "https://bellevue.tech/tools/task-tracker/";

    private WebView webView;
    private WebViewAssetLoader assetLoader;
    private boolean pageLoaded = false;
    private String pendingFileJson = null;

    private ValueCallback<Uri[]> fileChooserCallback;
    private String pendingSaveContent;
    private String pendingSaveFilename;

    private ActivityResultLauncher<Intent> fileChooserLauncher;
    private ActivityResultLauncher<Intent> saveFileLauncher;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

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

        assetLoader = new WebViewAssetLoader.Builder()
                .setDomain("bellevue.tech")
                .addPathHandler("/tools/task-tracker/",
                        new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setDatabaseEnabled(true);
        ws.setCacheMode(WebSettings.LOAD_NO_CACHE);
        ws.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        ws.setAllowFileAccess(false);

        webView.addJavascriptInterface(new AndroidNative(), "AndroidNative");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view,
                    WebResourceRequest request) {
                Uri url = request.getUrl();
                String host = url.getHost();
                String path = url.getPath();

                if ("bellevue.tech".equals(host)) {
                    if (path != null && (path.equals("/tools/task-tracker/")
                            || path.equals("/tools/task-tracker"))) {
                        Uri indexUrl = url.buildUpon()
                                .path("/tools/task-tracker/index.html").build();
                        return assetLoader.shouldInterceptRequest(indexUrl);
                    }
                    return assetLoader.shouldInterceptRequest(url);
                }
                return null;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                pageLoaded = true;
                view.evaluateJavascript(
                    "window.__ANDROID_APP__ = true; window.__APP_VERSION__ = '1.0.0';", null);
                injectPendingFile();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView,
                    ValueCallback<Uri[]> callback,
                    FileChooserParams fileChooserParams) {
                if (fileChooserCallback != null) {
                    fileChooserCallback.onReceiveValue(null);
                }
                fileChooserCallback = callback;
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("*/*");
                String[] mimeTypes = {"application/json", "application/octet-stream"};
                intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);
                try {
                    fileChooserLauncher.launch(Intent.createChooser(intent, "Import"));
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
        webView.loadUrl(LOCAL_URL);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleIntent(intent);
    }

    class AndroidNative {
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

        @JavascriptInterface
        public void shareFile(String content, String filename, String mimeType) {
            try {
                File cacheDir = new File(getCacheDir(), "shared");
                cacheDir.mkdirs();
                File file = new File(cacheDir, filename);
                FileOutputStream fos = new FileOutputStream(file);
                fos.write(content.getBytes("UTF-8"));
                fos.close();
                Uri uri = FileProvider.getUriForFile(
                        MainActivity.this, "tech.bellevue.tasktracker.fileprovider", file);
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

        @JavascriptInterface
        public void shareText(String text) {
            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("text/plain");
            shareIntent.putExtra(Intent.EXTRA_TEXT, text);
            startActivity(Intent.createChooser(shareIntent, "Share"));
        }

        @JavascriptInterface
        public void openUrl(String url) {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
        }
    }

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

    private void handleIntent(Intent intent) {
        if (intent == null) return;
        Uri uri = intent.getData();
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
                pendingFileJson = json;
                if (pageLoaded) injectPendingFile();
            }
        } catch (Exception e) {
            Toast.makeText(this, "Failed to read file", Toast.LENGTH_SHORT).show();
        }
    }

    private String readUri(Uri uri) throws IOException {
        InputStream is = getContentResolver().openInputStream(uri);
        if (is == null) return null;
        BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
        StringBuilder sb = new StringBuilder();
        char[] buf = new char[8192];
        int n;
        while ((n = reader.read(buf)) != -1) sb.append(buf, 0, n);
        reader.close();
        return sb.toString();
    }

    private void injectPendingFile() {
        if (pendingFileJson == null) return;
        String escaped = pendingFileJson
                .replace("\\", "\\\\")
                .replace("'", "\\'")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
        webView.evaluateJavascript(
                "if(typeof window.importFromAndroid==='function')window.importFromAndroid('" + escaped + "')", null);
        pendingFileJson = null;
    }
}
