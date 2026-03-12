#!/bin/bash
# Copies web app files into the Android assets directory and resizes icons
# for each mipmap density bucket.
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ASSETS_DIR="$SCRIPT_DIR/app/src/main/assets"
RES_DIR="$SCRIPT_DIR/app/src/main/res"
WEB_DIR="$SCRIPT_DIR/.."

# --- Web assets (served by WebViewAssetLoader) ---
rm -rf "$ASSETS_DIR"
mkdir -p "$ASSETS_DIR"

cp "$WEB_DIR/index.html"    "$ASSETS_DIR/"
cp "$WEB_DIR/sw.js"         "$ASSETS_DIR/"
cp "$WEB_DIR/manifest.json" "$ASSETS_DIR/"
cp "$WEB_DIR/icon-48.png"   "$ASSETS_DIR/"
cp "$WEB_DIR/icon-192.png"  "$ASSETS_DIR/"
cp "$WEB_DIR/icon-512.png"  "$ASSETS_DIR/"

echo "Web assets copied to $ASSETS_DIR"

# --- Launcher icons ---
# Uses sips (macOS) to resize the 512px icon for each density bucket.
# If sips is not available (Linux CI), falls back to copying the closest size.
SRC_ICON="$WEB_DIR/icon-512.png"

resize_icon() {
    local size=$1
    local dest=$2
    mkdir -p "$(dirname "$dest")"
    if command -v sips &>/dev/null; then
        sips -z "$size" "$size" "$SRC_ICON" --out "$dest" &>/dev/null
    elif command -v convert &>/dev/null; then
        convert "$SRC_ICON" -resize "${size}x${size}" "$dest"
    else
        cp "$WEB_DIR/icon-192.png" "$dest"
    fi
}

resize_icon 48  "$RES_DIR/mipmap-mdpi/ic_launcher.png"
resize_icon 72  "$RES_DIR/mipmap-hdpi/ic_launcher.png"
resize_icon 96  "$RES_DIR/mipmap-xhdpi/ic_launcher.png"
resize_icon 144 "$RES_DIR/mipmap-xxhdpi/ic_launcher.png"
resize_icon 192 "$RES_DIR/mipmap-xxxhdpi/ic_launcher.png"

echo "Launcher icons generated"

# --- Gradle wrapper ---
# The Gradle Wrapper JAR is a binary that can't be checked in easily.
# Generate it if missing. Requires 'gradle' to be installed (brew install gradle).
if [ ! -f "$SCRIPT_DIR/gradlew" ]; then
    echo "Generating Gradle wrapper..."
    if command -v gradle &>/dev/null; then
        (cd "$SCRIPT_DIR" && gradle wrapper --gradle-version 8.2)
        echo "Gradle wrapper generated"
    else
        echo "WARNING: 'gradle' not found. Install it (brew install gradle) then re-run,"
        echo "         or run: cd android && gradle wrapper --gradle-version 8.2"
    fi
else
    echo "Gradle wrapper already present"
fi
