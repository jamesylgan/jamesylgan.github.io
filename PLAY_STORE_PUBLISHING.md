# Publishing to Google Play Store

This repo contains 6 Android apps ready for Play Store publishing. This guide covers what's done, what's needed, and step-by-step instructions.

## Apps

| App | Package ID | Version | AAB Size |
|-----|-----------|---------|----------|
| Furniture Planner | `tech.bellevue.furnitureplanner` | 1.0.0 | 1.5MB |
| Move to Spain | `tech.bellevue.movetospain` | 1.0.0 | 1.5MB |
| Learn Spanish | `tech.bellevue.spanishtool` | 1.0.0 | 3.9MB |
| Task Tracker | `tech.bellevue.tasktracker` | 1.0.0 | 1.5MB |
| Tax Tracker | `tech.bellevue.taxtodos` | 1.0.0 | 1.5MB |
| Trip Planner | `tech.bellevue.tripplanner` | 1.6.2 | 7.3MB |

## What's Already Done

- [x] Adaptive icons (foreground PNG + background color + round variant) for all apps
- [x] R8/ProGuard minification enabled with rules for WebView JS bridge
- [x] Privacy policy at `privacy.html` (host at `https://bellevue.tech/privacy`)
- [x] Proper signing configs with release keystores
- [x] `targetSdk = 34` (meets Play Store requirement)
- [x] `minSdk = 24` (Android 7.0+, covers 99%+ of devices)
- [x] Minimal permissions (INTERNET only)
- [x] `usesCleartextTraffic = false`
- [x] Back button, rotation, and offline support
- [x] AAB builds verified for all apps

## What You Still Need

### 1. Google Play Developer Account ($25 one-time fee)

Sign up at https://play.google.com/console. You need a Google account. Verification takes 1-2 days.

### 2. Deploy the Privacy Policy

The privacy policy HTML is at `privacy.html` in the repo root. It needs to be accessible at a public URL before submitting apps.

- Push to your GitHub Pages site so it's at `https://bellevue.tech/privacy`
- Or host anywhere public — you just need a URL to enter in Play Console

### 3. Store Listing Assets (per app)

Play Console requires these for each app listing:

| Asset | Spec | Notes |
|-------|------|-------|
| App icon | 512x512 PNG | Already have `icon-512.png` in each tool dir |
| Feature graphic | 1024x500 PNG | Create a banner image per app |
| Screenshots | Min 2, 320-3840px | Take from phone/emulator, at least 2 per app |
| Short description | Max 80 chars | One-liner for search results |
| Full description | Max 4000 chars | Detailed feature list |

### 4. Content Rating Questionnaire

Play Console has an interactive questionnaire. For these apps:
- No violence, gambling, drugs, or sexual content
- No user-generated content shared between users
- Apps store data locally only (except Trip Planner which has optional Google Sheets sync)

Expected rating: **Everyone / PEGI 3**

### 5. App Signing

Google Play uses **Play App Signing**. On first upload:
1. Upload the AAB (not APK)
2. Play Console generates its own signing key
3. Your upload key (the keystore in each `android/` dir) is used only to authenticate uploads
4. Google re-signs the app with the Play signing key for distribution

**Important:** Keep your keystores safe. If you lose them, you can't push updates.

## Step-by-Step: Publishing One App

### Build the AAB

```bash
cd tools/TOOL_NAME/android
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

### Create the listing in Play Console

1. Go to https://play.google.com/console
2. Click **Create app**
3. Fill in: App name, default language, app/game, free/paid
4. Accept developer agreement

### Upload the AAB

1. Go to **Release > Production** (or Testing track first)
2. Click **Create new release**
3. Upload `app-release.aab`
4. Add release notes

### Complete store listing

1. **Main store listing:** App name, short description, full description
2. **Graphics:** Upload icon, feature graphic, screenshots
3. **Categorization:** Tools category, content rating questionnaire
4. **Privacy:** Enter privacy policy URL (`https://bellevue.tech/privacy`)

### Submit for review

1. Complete all required sections (Play Console shows a checklist)
2. Click **Send for review**
3. First review typically takes 1-3 days
4. Subsequent updates review in hours

## Recommended Publishing Order

1. **Trip Planner** — most mature (v1.6.2), most features
2. **Learn Spanish** — unique value prop, includes full 81k-word dictionary
3. **Task Tracker** — general utility, broad audience
4. **Move to Spain** — niche but complete
5. **Furniture Planner** — visual tool, good demo potential
6. **Tax Tracker** — very niche (Beckham Law + US expat)

## Testing Before Publishing

Use **Internal Testing** track first (no review needed, instant deploy):

1. Create internal testing track in Play Console
2. Upload AAB
3. Add your email to testers list
4. Install from Play Store link
5. Verify everything works on a real device via Play Store install

## Updating Apps

```bash
# 1. Bump versionCode and versionName in app/build.gradle.kts
# 2. Rebuild
cd tools/TOOL_NAME/android
./gradlew bundleRelease
# 3. Upload new AAB to Play Console
# 4. Add release notes, submit
```

**versionCode** must strictly increase with each upload. **versionName** is what users see.

## File Locations

```
tools/
  TOOL_NAME/
    android/
      app/
        build.gradle.kts          # Version, signing, build config
        proguard-rules.pro        # R8 minification rules
        src/main/
          AndroidManifest.xml     # Permissions, activities
          assets/                 # Bundled web app files
          java/tech/bellevue/*/   # MainActivity.java
          res/
            drawable/             # Adaptive icon background
            layout/               # WebView layout
            mipmap-*/             # App icons (all densities)
            mipmap-anydpi-v26/    # Adaptive icon XML
            values/               # strings.xml, colors.xml, themes.xml
            xml/                  # FileProvider paths
      TOOL.keystore               # Release signing key (DO NOT LOSE)
      build.gradle.kts            # Root build config
      settings.gradle.kts         # Project settings
    icon-512.png                  # Store listing icon
    index.html                    # Web app source
    manifest.json                 # PWA manifest
    sw.js                         # Service worker
```
