# Building the Trip Planner Android APK

> **Note:** The original Bubblewrap/TWA approach has been replaced with a custom WebView wrapper that supports bundled assets, offline tile caching, and .trip file handling. See [`android/README.md`](android/README.md) for full build instructions.

## Quick Build

```bash
cd tools/trip-planner/android

# Bundle web assets + generate icons
./copy-assets.sh

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# Install on connected device
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Rebuild After Web App Changes

Any time `index.html` changes, re-bundle and rebuild:

```bash
cd tools/trip-planner/android
./copy-assets.sh
./gradlew assembleRelease
```

## Environment Setup

See [android/README.md § Environment Setup](android/README.md#environment-setup) for prerequisites (Java 17+, Android SDK).
