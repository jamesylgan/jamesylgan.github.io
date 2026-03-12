# Building the Trip Planner Android APK

This uses [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) (by Google Chrome Labs) to wrap the PWA as a Trusted Web Activity (TWA) Android app.

## Prerequisites

- Node.js 14.15+
- Java JDK 11+ (you already have JDK 17)
- Android SDK will be downloaded automatically by Bubblewrap on first run

## Steps

### 1. Install Bubblewrap CLI

```bash
npm i -g @bubblewrap/cli
```

### 2. Initialize the project

From the `tools/trip-planner/` directory:

```bash
mkdir -p android && cd android
bubblewrap init --manifest https://jamesylgan.github.io/tools/trip-planner/manifest.json
```

Bubblewrap will prompt for:
- **Domain**: `jamesylgan.github.io`
- **App name**: `Trip Planner`
- **Package name**: `io.github.jamesylgan.tripplanner`
- **Signing key**: create a new one (save the password!)
- It will download Android SDK/build tools if needed (~1GB first time)

### 3. Build the APK

```bash
bubblewrap build
```

This generates:
- `app-release-signed.apk` — sideload this to your phone
- `app-release-bundle.aab` — for Play Store upload

### 4. Install on your phone

Transfer the APK to your Android device and install it. You may need to enable "Install from unknown sources" in Android settings.

```bash
# If you have adb set up:
adb install app-release-signed.apk
```

### 5. Set up Digital Asset Links (optional, for verified TWA)

To remove the browser URL bar in the TWA, add this file to your site at `/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "io.github.jamesylgan.tripplanner",
    "sha256_cert_fingerprints": ["YOUR_SIGNING_KEY_FINGERPRINT"]
  }
}]
```

Get the fingerprint from your signing key:
```bash
keytool -list -v -keystore ./your-keystore.keystore | grep SHA256
```

## Updating the APK after site changes

The TWA loads from the live website, so most updates require no APK rebuild — just push to GitHub Pages. Only rebuild the APK if you change:
- The manifest (icons, name, theme color)
- TWA-specific settings (orientation, splash screen)

To rebuild:
```bash
cd android
bubblewrap build
```

## Adding JSON file intent filter

To make the app handle `.json` files from WhatsApp/file managers, the `file_handlers` in `manifest.json` handles this for PWA. For the native APK, Bubblewrap picks this up from the manifest automatically.

If it doesn't work, you can manually add an intent filter in `android/app/src/main/AndroidManifest.xml`:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="content" />
    <data android:mimeType="application/json" />
</intent-filter>
```

Then rebuild with `bubblewrap build`.

## Offline support

The service worker (`sw.js`) caches the app shell and Leaflet libraries for offline use. Map tiles still require internet, but all other features (viewing trips, editing, exporting) work offline. Data is stored in localStorage.
