# Vector Offline Maps — Debugging Notes

## Status: Broken / Paused

The vector tile rendering via protomaps-leaflet works in the browser but does not work on the Android WebView app. The feature is currently disabled (hidden behind "Offline Maps (broken)" setting).

## What Works

- **Browser rendering**: protomaps-leaflet v5.1.0 renders PMTiles files correctly in desktop browsers when served with HTTP Range request support (206 Partial Content)
- **Range requests**: The Android `shouldInterceptRequest` in `MainActivity.java` (method `servePmtilesFile`, ~line 596) correctly handles Range requests, returning 206 with proper `Content-Range` and `Content-Length` headers
- **PMTiles data**: World basemap (zoom 0-4, 5.7MB) bundled as APK asset. 366 Spanish city PMTiles (zoom 0-14) generated and available in GitHub releases
- **Config system**: config.json in `jamesylgan/Spain-pmtiles` repo with country/region/city hierarchy
- **Download system**: AndroidNative Java interface for downloading PMTiles from GitHub releases

## Confirmed Browser Test Results

Using `serve.py` (Range-enabled HTTP server on localhost:8080) and `test-vector.html`:
- `paintRules: 32, labelRules: 9, backgroundColor: #cccccc` — library loads correctly
- Range test: `status=206, Content-Range: bytes 0-100/5977080` — Range requests work
- Multiple Range requests for tile data succeed (z4 world tiles, z12 city tiles)
- Tile pixel sampling: 3-12 unique colors per tile → features render correctly
- Both world basemap and city overlay (Alcobendas, Spain) render with full features

## What Doesn't Work on Android

### Problem 1: Vector layers never created (timing bug)
- `initMap()` runs during initial page load BEFORE `onPageFinished` sets `__ANDROID_APP__`
- First `initMap()` call: `__ANDROID_APP__` not set → skips vector layer creation
- Second `initMap()` call (from `onPageFinished` → `render()`): map already exists → early return
- **Fix attempted**: Extracted `_initVectorLayers()` function, called it in the early-return path
- **Result**: Toast/alert diagnostics inside `_initVectorLayers()` never appeared, suggesting the function was never reached

### Problem 2: Button onclick not firing
- The Vector button's `onclick="_toggleVectorLayer()"` handler never fires on Android WebView
- Even `onclick="alert('test')"` on the button produced no alert
- Other buttons in the same row (Export GPX, Offline Maps) presumably work
- The function IS at global scope in the same `<script>` tag as other working functions
- Root cause unknown — possibly a WebView rendering issue, z-index overlap, or button not actually being rendered

### Debugging technique: onPageFinished alert injection
To verify the correct APK is running, inject an alert in `onPageFinished`:
```java
view.evaluateJavascript(
    "window.__ANDROID_APP__ = true; window.__APP_VERSION__ = '1.2.1';"
    + "alert('BUILD ID: protomapsL=' + (typeof protomapsL) + ' map=' + (typeof map));"
    + "if(typeof render==='function')render();", null);
```
This confirmed: `protomapsL=object` (library loaded), `map=undefined` (map not yet created at this point).

### Problem 3: WebView asset caching
- After rebuilding and uploading APK, the device continued running old code
- `webView.clearCache(true)` and version code bump eventually resolved this
- Added version-upgrade cache clearing: checks `last_version_code` in SharedPreferences

## Key Technical Details

### PMTiles Requires HTTP Range Requests
PMTiles is a single-file tile archive that uses HTTP byte-range requests to read individual tiles. The library's `FetchSource.getBytes()` sends `fetch(url, {headers: {Range: 'bytes=start-end'}})` and expects a 206 response. If the server returns 200 with the full file, the library throws:
> "Server returned no content-length header or content-length exceeding request. Check that your storage backend supports HTTP Byte Serving."

This results in only `backgroundColor` rendering → gray tiles.

### protomaps-leaflet Cache Behavior
The PMTiles library only sets `cache: "no-store"` on Chrome Windows (`this.chromeWindowsNoCache`). On Android WebView and macOS browsers, the default cache policy is used, which can serve stale 200 responses from browser cache.

### protomaps-leaflet backgroundColor
- `flavor: 'light'` sets `backgroundColor: '#cccccc'` (gray = ocean color)
- `flavor: 'dark'` sets `backgroundColor: '#34373d'`
- This fills every tile canvas BEFORE rendering features
- Setting `layer.backgroundColor = null` makes the canvas transparent
- City layers should have null backgroundColor so they don't cover the world basemap outside their bbox

### Layer Architecture (for re-implementation)
```
World basemap: protomapsL.leafletLayer({
    url: '.../world-overview.pmtiles',
    maxDataZoom: 4,        // only z0-4 data in file
    maxNativeZoom: 14,     // Leaflet creates tiles up to z14, CSS-scales beyond
    maxZoom: 19,
    flavor: 'light'        // or 'dark'
})
// Keep backgroundColor for ocean color

City layers: protomapsL.leafletLayer({
    url: '.../city-name.pmtiles',
    maxDataZoom: 14,       // z0-14 data in file
    maxNativeZoom: 14,
    maxZoom: 19,
    flavor: 'light'
})
layer.backgroundColor = null;  // transparent overlay
```

### Toggle Behavior (for re-implementation)
When enabling vector mode:
1. Add vector layers to map (world basemap + city layers)
2. Remove raster tiles (`_rasterTileLayer`)
When disabling:
1. Remove vector layers
2. Re-add raster tiles

Auto-detection: `navigator.onLine === false` → auto-enable vector (offline mode)

### Label Zoom Levels
- z9+: City names
- z12+: Highway and major road labels
- z16+: Minor road and path labels
- Language: defaults to 'en' via `r.lang || "en"`

## Files

- `index.html` — Main web app (vector layer code currently disabled)
- `android/.../MainActivity.java` — Android WebView with shouldInterceptRequest for PMTiles
- `lib/protomaps-leaflet.js` — Bundled protomaps-leaflet v5.1.0
- `lib/leaflet.js` / `lib/leaflet.css` — Bundled Leaflet
- `test-vector.html` — Browser test page (use with serve.py)
- `serve.py` — Range-enabled HTTP server for local browser testing
- `offline-pmtiles/` — Symlinks to local PMTiles files for browser testing

## Potential Next Steps

1. **Use a local HTTP server on Android** instead of `shouldInterceptRequest` — run a lightweight HTTP server on localhost inside the app to serve PMTiles with full Range support. This would bypass any WebView header/status-code issues.
2. **Switch to MapLibre GL JS** — protomaps-leaflet is in maintenance mode. MapLibre GL JS is recommended as the successor. Would require significant rework but is more actively maintained.
3. **Debug WebView with Chrome DevTools** — connect Android device via USB, open `chrome://inspect`, and inspect the WebView directly to see console errors, network requests, and DOM state.
4. **Pre-extract tiles** — Instead of PMTiles Range requests, pre-extract tiles to individual files or SQLite and serve them as individual tile requests (z/x/y pattern). This avoids the Range request requirement entirely.
