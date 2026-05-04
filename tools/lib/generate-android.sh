#!/bin/bash
# Generate a minimal Android WebView wrapper for a tool.
# Usage: ./generate-android.sh <tool-dir> <app-name> <short-id> <theme-color> <bg-color>
# Example: ./generate-android.sh appeal "EX-19 Appeal" appeal "#2563eb" "#f0f2f5"
set -e

TOOL_DIR="$1"
APP_NAME="$2"
SHORT_ID="$3"    # e.g. "appeal", "spanishtool" — no hyphens, used in package name
THEME_COLOR="$4" # e.g. "#2563eb"
BG_COLOR="$5"    # e.g. "#f0f2f5"
TOOL_PATH="$(basename "$TOOL_DIR")"  # e.g. "appeal", "spanish-tool"

ANDROID_DIR="$TOOL_DIR/android"
PKG="tech.bellevue.${SHORT_ID}"
PKG_DIR="$ANDROID_DIR/app/src/main/java/tech/bellevue/${SHORT_ID}"
RES_DIR="$ANDROID_DIR/app/src/main/res"
ASSETS_DIR="$ANDROID_DIR/app/src/main/assets"

echo "=== Generating Android project for $APP_NAME ==="
echo "  tool-path: $TOOL_PATH"
echo "  package: $PKG"

mkdir -p "$PKG_DIR" "$RES_DIR/values" "$RES_DIR/layout" "$RES_DIR/xml" "$ASSETS_DIR"
mkdir -p "$RES_DIR/mipmap-mdpi" "$RES_DIR/mipmap-hdpi" "$RES_DIR/mipmap-xhdpi" "$RES_DIR/mipmap-xxhdpi" "$RES_DIR/mipmap-xxxhdpi"

# --- Root build.gradle.kts ---
cat > "$ANDROID_DIR/build.gradle.kts" <<'ROOTGRADLE'
plugins {
    id("com.android.application") version "8.2.0" apply false
}
ROOTGRADLE

# --- settings.gradle.kts ---
cat > "$ANDROID_DIR/settings.gradle.kts" <<SETTINGS
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "${SHORT_ID}"
include(":app")
SETTINGS

# --- gradle.properties ---
cat > "$ANDROID_DIR/gradle.properties" <<'PROPS'
android.useAndroidX=true
org.gradle.jvmargs=-Xmx2048m
PROPS

# --- app/build.gradle.kts ---
cat > "$ANDROID_DIR/app/build.gradle.kts" <<APPGRADLE
plugins {
    id("com.android.application")
}

android {
    namespace = "${PKG}"
    compileSdk = 34

    defaultConfig {
        applicationId = "${PKG}"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    signingConfigs {
        create("release") {
            storeFile = file("../${SHORT_ID}.keystore")
            storePassword = "${SHORT_ID}2026"
            keyAlias = "${SHORT_ID}"
            keyPassword = "${SHORT_ID}2026"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.8.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
}
APPGRADLE

# --- AndroidManifest.xml ---
cat > "$ANDROID_DIR/app/src/main/AndroidManifest.xml" <<MANIFEST
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.App"
        android:usesCleartextTraffic="false">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:configChanges="orientation|screenSize|keyboardHidden">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Open JSON files via content:// -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="content" android:mimeType="application/json" />
            </intent-filter>

            <!-- Share sheet -->
            <intent-filter>
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="application/json" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${PKG}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>
</manifest>
MANIFEST

# --- MainActivity.java ---
cat > "$PKG_DIR/MainActivity.java" <<JAVA
package ${PKG};

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

    private static final String LOCAL_URL = "https://bellevue.tech/tools/${TOOL_PATH}/";

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
                .addPathHandler("/tools/${TOOL_PATH}/",
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
                    if (path != null && (path.equals("/tools/${TOOL_PATH}/")
                            || path.equals("/tools/${TOOL_PATH}"))) {
                        Uri indexUrl = url.buildUpon()
                                .path("/tools/${TOOL_PATH}/index.html").build();
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
                        MainActivity.this, "${PKG}.fileprovider", file);
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
                .replace("\\\\", "\\\\\\\\")
                .replace("'", "\\\\'")
                .replace("\\n", "\\\\n")
                .replace("\\r", "\\\\r");
        webView.evaluateJavascript(
                "if(typeof window.importFromAndroid==='function')window.importFromAndroid('" + escaped + "')", null);
        pendingFileJson = null;
    }
}
JAVA

# --- Resources ---
cat > "$RES_DIR/values/strings.xml" <<STRINGS
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${APP_NAME}</string>
</resources>
STRINGS

cat > "$RES_DIR/values/colors.xml" <<COLORS
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">${THEME_COLOR}</color>
    <color name="background">${BG_COLOR}</color>
</resources>
COLORS

cat > "$RES_DIR/values/themes.xml" <<THEMES
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.App" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryDark">@color/primary</item>
        <item name="android:statusBarColor">@color/primary</item>
        <item name="android:navigationBarColor">@color/background</item>
        <item name="android:windowBackground">@color/background</item>
    </style>
</resources>
THEMES

cat > "$RES_DIR/layout/activity_main.xml" <<LAYOUT
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">
    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
</FrameLayout>
LAYOUT

cat > "$RES_DIR/xml/file_paths.xml" <<FILEPATHS
<?xml version="1.0" encoding="utf-8"?>
<paths>
    <cache-path name="shared" path="shared/" />
</paths>
FILEPATHS

# --- Copy web assets ---
cp "$TOOL_DIR/index.html" "$ASSETS_DIR/"
cp "$TOOL_DIR/sw.js" "$ASSETS_DIR/"
cp "$TOOL_DIR/manifest.json" "$ASSETS_DIR/"

# Copy any external JS dependencies the tool uses
for js in "$TOOL_DIR"/*.js; do
    [ -f "$js" ] && [ "$(basename "$js")" != "sw.js" ] && cp "$js" "$ASSETS_DIR/"
done

# --- Copy lib/ dependencies referenced by the HTML ---
LIB_DIR="$(dirname "$TOOL_DIR")/lib"
if [ -d "$LIB_DIR" ]; then
    mkdir -p "$ASSETS_DIR/../lib"  # Will be at assets/../lib which is wrong
    # Actually we need them relative to the tool path. For WebViewAssetLoader
    # serving /tools/TOOL_PATH/*, we put everything in assets/.
    # External scripts use ../lib/ paths, so we need a lib/ sibling.
    # The simplest fix: rewrite ../lib/ to lib/ in the HTML and copy libs into assets/lib/
    mkdir -p "$ASSETS_DIR/lib"
    # Parse the HTML for ../lib/ references and copy those files
    grep -oP '\.\./lib/[^"'"'"' ]+' "$TOOL_DIR/index.html" 2>/dev/null | sort -u | while read -r ref; do
        fname="${ref#../lib/}"
        src="$LIB_DIR/$fname"
        if [ -f "$src" ]; then
            cp "$src" "$ASSETS_DIR/lib/"
            echo "  Copied lib/$fname"
        fi
    done
    # Rewrite ../lib/ to lib/ in the copied HTML
    sed -i '' 's|\.\./lib/|lib/|g' "$ASSETS_DIR/index.html"
fi

# --- Generate keystore ---
if [ ! -f "$ANDROID_DIR/${SHORT_ID}.keystore" ]; then
    keytool -genkey -v -keystore "$ANDROID_DIR/${SHORT_ID}.keystore" \
        -alias "$SHORT_ID" -keyalg RSA -keysize 2048 -validity 10000 \
        -storepass "${SHORT_ID}2026" -keypass "${SHORT_ID}2026" \
        -dname "CN=${APP_NAME}, O=Bellevue Tech, L=Bellevue, ST=WA, C=US" 2>/dev/null
    echo "  Keystore generated"
fi

# --- Copy Gradle wrapper from trip-planner ---
TRIP_ANDROID="$(dirname "$TOOL_DIR")/trip-planner/android"
if [ -d "$TRIP_ANDROID/gradle" ]; then
    cp -r "$TRIP_ANDROID/gradle" "$ANDROID_DIR/"
    cp "$TRIP_ANDROID/gradlew" "$ANDROID_DIR/"
    cp "$TRIP_ANDROID/gradlew.bat" "$ANDROID_DIR/"
    chmod +x "$ANDROID_DIR/gradlew"
fi

# --- local.properties ---
cat > "$ANDROID_DIR/local.properties" <<LOCAL
sdk.dir=/Users/james.gan/Android/sdk
LOCAL

echo "=== Done: $ANDROID_DIR ==="
