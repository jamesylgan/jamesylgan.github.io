# Trip Planner Android APK

A lightweight Android wrapper that runs the Trip Planner PWA in a WebView with native file handling and offline map tile caching.

## How It Works

### Architecture

```
┌──────────────────────────────────────┐
│  Android APK                         │
│  ┌────────────────────────────────┐  │
│  │ MainActivity (WebView)         │  │
│  │                                │  │
│  │  1. Loads from bundled assets/ │  │
│  │     (no network needed)        │  │
│  │                                │  │
│  │  2. WebViewAssetLoader serves  │  │
│  │     under https://bellevue.    │  │
│  │     tech origin (same-origin   │  │
│  │     localStorage)              │  │
│  │                                │  │
│  │  3. Intercepts OSM raster tile │  │
│  │     requests → TileCache       │  │
│  │                                │  │
│  │  4. Intercepts /offline-tiles/ │  │
│  │     MVT requests →             │  │
│  │     OfflineMapStore            │  │
│  │                                │  │
│  │  5. AndroidNative JS interface │  │
│  │     for offline map downloads  │  │
│  └────────────────────────────────┘  │
│                                      │
│  Intent Filters:                     │
│  • .trip files from file managers    │
│  • .trip files from WhatsApp/Gmail   │
│  • Share sheet (ACTION_SEND)         │
│                                      │
│  JS Bridge:                          │
│  • importTripFromAndroid(json)       │
│  • AndroidNative.downloadRegion()    │
│  • AndroidNative.getRegions()        │
│  • AndroidNative.deleteRegion()      │
│  • window.__onDownloadProgress()     │
└──────────────────────────────────────┘
```

### Relationship to index.html

The web app (`../index.html`) is a **single-file PWA** — all HTML, CSS, and JS in one file. The Android APK does NOT modify or fork it. Instead:

- **Local-first**: The APK always loads `index.html` from bundled assets — no network round-trip, instant startup, fully offline. `WebViewAssetLoader` serves the files under `https://bellevue.tech/tools/trip-planner/` so localStorage keys are consistent with the hosted PWA.
- **Map tiles**: OSM tile requests are intercepted and cached in a local SQLite database. Tiles you've viewed before are available offline.
- **JS bridge**: `index.html` defines `window.importTripFromAndroid(jsonString)` — a global function that the Android Java code calls via `evaluateJavascript()` to inject trip data from `.trip` files.
- **Updating the app**: To get a new version of the web app, rebuild the APK with `./copy-assets.sh && ./gradlew assembleDebug`. There is no over-the-air update mechanism.

The same `index.html` works identically in a regular browser, as an installed PWA, and inside this Android WebView.

### .trip File Handling

When a user taps a `.trip` file in WhatsApp, Gmail, or a file manager:

1. Android routes the intent to `MainActivity` (via intent filters in `AndroidManifest.xml`)
2. `handleIntent()` reads the file content via `ContentResolver.openInputStream()`
3. The JSON string is stored in `pendingTripJson`
4. After the page finishes loading, `injectPendingTrip()` calls `evaluateJavascript("window.importTripFromAndroid('...')")`
5. The web app parses the JSON, adds the trip to `localStorage`, and opens it

### Offline Map Tiles

There are two layers of offline map support:

#### Raster tile cache (progressive, automatic)

OSM tile requests (`tile.openstreetmap.org`) are intercepted in `shouldInterceptRequest()`:

1. **Cache hit**: Return tile from SQLite database (`tile_cache.db`)
2. **Cache miss**: Fetch from network, store in cache, return to WebView
3. **Network failure**: Fall back to any cached version (even if expired)

Tiles are cached for 30 days. As the user browses the map, tiles are progressively cached.

#### Vector tile downloads (on-demand, per-leg)

Users can proactively download vector map tiles for trip legs via the "Offline Maps" modal (Android app only). This uses PMTiles archives as the source:

1. User taps "Offline Maps" button on the map view
2. Modal shows each leg with estimated tile count and size
3. User taps "Download" → Android reads tiles from a remote PMTiles archive via HTTP range requests
4. Tiles are decompressed (gzip) and stored in `offline_maps.db` SQLite database
5. `protomaps-leaflet` renders the vector tiles in a layer above the raster tiles
6. Requests to `/offline-tiles/{z}/{x}/{y}.mvt` are intercepted and served from SQLite

**Key components:**
- `PMTilesReader.java` — Custom PMTiles v3 reader (Hilbert curve, directory parsing, HTTP range requests)
- `PMTilesDownloader.java` — Background downloader on `ExecutorService`, reports progress to WebView
- `OfflineMapStore.java` — SQLite database with `regions` and `offline_tiles` tables
- `AndroidNative` JS interface — Bridge for download/delete/query operations

**Configurable source URL:** The PMTiles source URL is stored in SharedPreferences and configurable in Settings. Default is a Protomaps daily build. Any PMTiles v3 archive with HTTP range request support works.

## Environment Setup

### Prerequisites

- **macOS** (these instructions use Homebrew; adapt for Linux)
- **Java 17+** — required by Android Gradle Plugin 8.x

### One-Time Setup

```bash
# 1. Install Java (if not already installed)
brew install openjdk@17
# Add to ~/.zshrc:
export JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null || echo /opt/homebrew/opt/openjdk@17)
export PATH="$JAVA_HOME/bin:$PATH"

# 2. Install Android command-line tools
brew install --cask android-commandlinetools

# 3. Install SDK components
sdkmanager --sdk_root=$HOME/Android/sdk \
    "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# 4. Accept licenses
yes | sdkmanager --sdk_root=$HOME/Android/sdk --licenses

# 5. Set environment variables (add to ~/.zshrc)
export ANDROID_HOME=$HOME/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# 6. Install Gradle (needed once to generate the wrapper)
brew install gradle
```

### Verify Setup

```bash
java -version          # Should show 17+
adb --version          # Should show platform-tools version
gradle --version       # Should show 8.x
```

## Build

```bash
cd tools/trip-planner/android

# Bundle web assets + generate icons + create Gradle wrapper
./copy-assets.sh

# Build debug APK (first run downloads Gradle distribution + dependencies)
./gradlew assembleDebug

# Install on connected device
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Rebuild After Web App Changes

If `index.html` is updated:

```bash
./copy-assets.sh              # Re-copy web files
./gradlew assembleDebug       # Rebuild APK
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## Project Structure

```
android/
├── app/
│   ├── build.gradle.kts              # App-level build config
│   └── src/main/
│       ├── AndroidManifest.xml       # Permissions + intent filters
│       ├── assets/                   # Bundled web files (generated)
│       │   ├── index.html
│       │   ├── sw.js
│       │   ├── manifest.json
│       │   └── icon-*.png
│       ├── java/tech/bellevue/tripplanner/
│       │   ├── MainActivity.java     # WebView + intent handling + JS interface
│       │   ├── TileCache.java        # SQLite raster tile cache (progressive)
│       │   ├── OfflineMapStore.java  # SQLite vector tile store (on-demand downloads)
│       │   ├── OfflineRegion.java    # Data class for downloaded map regions
│       │   ├── PMTilesReader.java    # PMTiles v3 archive reader (HTTP range requests)
│       │   └── PMTilesDownloader.java # Background tile downloader
│       └── res/
│           ├── layout/activity_main.xml
│           ├── mipmap-*/ic_launcher.png
│           └── values/{strings,colors,themes}.xml
├── build.gradle.kts                  # Root build config (AGP version)
├── settings.gradle.kts               # Project settings
├── gradle.properties                 # Gradle JVM args
├── gradle/wrapper/
│   └── gradle-wrapper.properties     # Gradle version (8.2)
├── copy-assets.sh                    # Asset bundling + icon generation
├── .gitignore                        # Excludes build outputs + generated files
└── README.md                         # This file
```

## Testing Checklist

- [ ] `./gradlew assembleDebug` builds successfully
- [ ] APK installs and loads the web app instantly from bundled assets
- [ ] Works on first launch with no internet (fully offline)
- [ ] Send a `.trip` file from WhatsApp → opens Trip Planner and imports it
- [ ] Share a `.trip` file via share sheet → Trip Planner receives and imports it
- [ ] Map tiles load; after viewing, same area loads offline from cache
- [ ] Back button navigates within the web app before exiting
- [ ] "Offline Maps" button appears on map view in Android app, NOT in browser
- [ ] Tapping "Download" for a leg downloads tiles with progress bar
- [ ] After download, map area shows vector tiles (crisp, styled)
- [ ] Airplane mode: downloaded areas render offline, non-downloaded areas fall back to cached raster
- [ ] Manage tab shows correct sizes, delete works at city and country level
- [ ] Changing PMTiles source URL in settings works for subsequent downloads
- [ ] "Download entire trip" queues and downloads all legs

## Signed Release APK

Release builds are signed with `trip-planner.keystore` (gitignored). The signing config is in `app/build.gradle.kts`.

### Building a signed release

```bash
cd tools/trip-planner/android
./copy-assets.sh              # Bundle latest web assets
./gradlew assembleRelease     # Build signed APK
# Output: app/build/outputs/apk/release/app-release.apk
```

### Keystore details

| Field | Value |
|---|---|
| File | `android/trip-planner.keystore` |
| Alias | `tripplanner` |
| Algorithm | RSA 2048-bit |
| Validity | 10,000 days (~27 years) |
| Store password | `tripplanner2026` |
| Key password | `tripplanner2026` |

**Keep this keystore safe.** If lost, you cannot push updates to devices that installed the app — Android requires the same signing key for upgrades.

### Recreating the keystore (if lost)

```bash
keytool -genkey -v -keystore trip-planner.keystore \
    -alias tripplanner -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass <password> -keypass <password> \
    -dname "CN=Trip Planner, O=Bellevue Tech, L=Bellevue, ST=WA, C=US"
```

> **Warning:** A new keystore means a new signing identity. Users with the old APK must uninstall before installing the new one (app data is lost).

### Creating a GitHub release

```bash
cp app/build/outputs/apk/release/app-release.apk /tmp/trip-planner-v<VERSION>.apk
cd ../../..  # repo root
gh release create v<VERSION>-android \
    --title "Trip Planner Android v<VERSION>" \
    --notes "Release notes here" \
    /tmp/trip-planner-v<VERSION>.apk
```
