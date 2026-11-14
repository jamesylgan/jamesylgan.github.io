# Task Tracker

A fully client-side, single-file task tracker that runs entirely in the browser. All data is stored in localStorage — nothing is ever sent to a server.

## Features

### Core
- **Groups & Tasks** — Organize tasks into named groups with descriptions
- **Completable Tasks** — Check off tasks as you finish them
- **Due Dates** — Set due dates with overdue/due-soon visual indicators
- **Repeating Tasks** — Daily, weekly, biweekly, or monthly recurrence with day-of-week selection, time, and repeat count
- **Repeat Backfill** — Automatically creates missed repeat occurrences when you return after time away
- **Priority Levels** — Customizable priority levels with icons (default: High/Medium/Low)
- **Sizing / Effort** — Estimate task effort with customizable levels (default: S/M/L)
- **Notes** — Add notes/descriptions to any task
- **Links** — Attach URLs to both groups and individual tasks
- **Categories** — Custom per-group categories with color coding and progress tracking
- **Custom Columns** — Define arbitrary data columns per group with a columned layout option and resizable widths
- **Group Status Badges** — Unstarted / In Progress / Completed badges on groups
- **Progress Tracking** — Per-group and overall progress bars, with optional per-category breakdowns

### Organization
- **Archive** — Archive individual tasks or entire groups; archived groups display nested in the Archive tab with constrained restore (must restore group before restoring its tasks)
- **Trash** — Deleted items go to trash for 30 days before permanent removal
- **Session Undo** — Ctrl+Z undo for archive, restore, and delete actions (kept in memory until page close)
- **Configurable Dismiss Actions** — Choose between delete, archive, or both buttons per task
- **Inline Delete Confirmations** — Red Yes / white No confirmation on all delete actions
- **Next TODOs** — Pin important tasks into a dedicated "up next" section
- **Drag-and-drop Reordering** — Reorder tasks within groups (with optional arrow-button mode)

### Data
- **Auto-save** — All changes saved automatically to localStorage
- **Separate Storage** — Hosted and local (`file://`) versions use different storage keys so they don't conflict
- **JSON Export/Import** — Full data export and import as JSON files
- **Settings Export/Import** — Separately export/import your configuration (all settings, labels, icons, levels)
- **Clear All Data** — Protected by "I am really sure" typed confirmation
- **Reset Settings to Default** — Reset all settings without affecting task data (same typed confirmation)
- **Sample Data** — Load example data to explore features (only available when empty)

### Encryption
- **Optional passphrase encryption** — Encrypt your stored data with a passphrase (e.g. your email address)
- Uses Web Crypto API: PBKDF2 key derivation (600K iterations, SHA-256) + AES-256-GCM
- Passphrase is never stored — only kept in memory while the tab is open
- Wrong passphrase is detected and rejected (GCM authenticated encryption)
- Exported JSON files are always plaintext (encryption only protects localStorage)

### Customization
- **Dark Mode** — Full dark theme support
- **Color Customization** — Accent color and progress bar gradient end color
- **Date Format** — Choose between YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY
- **Configurable UI Text** — Edit all labels via YAML-style text editor
- **Custom Icons** — Edit all icons (settings, edit, archive, delete, calendar, repeat, notes, etc.)
- **Custom Priority Levels** — Add/remove/rename priority levels with custom icons
- **Custom Size Levels** — Configure effort estimation options (S/M/L, time durations, or anything)
- **All Features Toggleable** — Every feature (due dates, repeat, archive, trash, priority, sizing, notes, progress, encryption) can be turned on/off independently

### Settings UI
- **Menu Mode** — Traditional toggle/settings list with standard toggles and segmented buttons
- **Visual Mode** — Full-page or modal WYSIWYG preview where you click elements to toggle features and click underlined text to edit labels and icons
- **Settings Organization** — Move any setting between Main, Advanced, or Hidden via a visual organize mode with drag-to-reorder
- **Resizable Settings Panel** — Drag to resize on desktop

### Other
- **Mobile Friendly** — Responsive layout for phones and tablets
- **Single HTML File** — No dependencies, no build step, no server needed

## Usage

Open `index.html` in a browser. That's it.

For hosted deployment, just serve the file from any static host. The app detects whether it's running from `file://` or `http(s)://` and uses separate localStorage keys for each.

## Data Storage

| Key | Contents |
|-----|----------|
| `task-tracker-local-v1` or `task-tracker-hosted-v1` | Task data (groups, tasks, trash, repeat history) |
| `task-tracker-settings-v1` | Settings/config (shared between local and hosted) |
| `task-tracker-*-salt` | Encryption salt (only when encryption is enabled) |

## Android app: signing key was committed (rotate before any release)

> **Note: the key for local development was pushed to this repo.**
> `android/tasktracker.keystore` (plus both of its passwords, hardcoded in
> `android/app/build.gradle.kts`, and a signed `app-release.apk`) was committed
> to a public repository. Treat the key as **compromised**. It is fine for local
> debugging only. **For any real release, rotate the key first** (how to generate
> and rotate it is below), and **untrack the key files** with the commands in
> [step 4](#4-untrack-the-sensitive-files).

Package name: `tech.bellevue.tasktracker`.

### What rotation does to existing installs

- **Sideloaded APKs:** Android will not update an app signed with a different
  key, so users must uninstall and reinstall. Uninstalling **deletes the app's
  local data** (it lives in the WebView's `localStorage`). Export your data from
  inside the tool first if it offers export/import.
- **Google Play with Play App Signing:** only the *upload* key is reset (Play
  Console -> App integrity -> App signing). Users are not affected.
- **Published to Play with this key and no Play App Signing:** Play does not
  allow changing the signing key of an existing listing. Enrol in Play App
  Signing, or publish under a new package name.
- If the app was **never released** (local/debug use only), generate a new key,
  untrack the old one, and ignore the migration concerns.

### 1. Generate a new keystore (outside the repo)

```bash
mkdir -p ~/.android-keys && chmod 700 ~/.android-keys

keytool -genkeypair -v \
  -keystore ~/.android-keys/tasktracker-release.jks \
  -alias tasktracker \
  -keyalg RSA -keysize 4096 -validity 10000 \
  -storetype PKCS12

chmod 600 ~/.android-keys/tasktracker-release.jks
```

Use a strong, unique password (do not reuse the old one) and **back up** the
`.jks` and its password privately; losing it means you cannot ship updates under
that key. Record the new fingerprint:

```bash
keytool -list -v -keystore ~/.android-keys/tasktracker-release.jks -alias tasktracker
```

### 2. Stop hardcoding credentials

Put the secrets in your **user-level** `~/.gradle/gradle.properties` (outside the
repo):

```properties
TASKTRACKER_STORE_FILE=/Users/<you>/.android-keys/tasktracker-release.jks
TASKTRACKER_STORE_PASSWORD=<new password>
TASKTRACKER_KEY_ALIAS=tasktracker
TASKTRACKER_KEY_PASSWORD=<new password>
```

Then replace the hardcoded `signingConfigs` block in
`android/app/build.gradle.kts`:

```kotlin
signingConfigs {
    create("release") {
        val storePath = providers.gradleProperty("TASKTRACKER_STORE_FILE").orNull
        if (storePath != null) {
            storeFile = file(storePath)
            storePassword = providers.gradleProperty("TASKTRACKER_STORE_PASSWORD").get()
            keyAlias = providers.gradleProperty("TASKTRACKER_KEY_ALIAS").get()
            keyPassword = providers.gradleProperty("TASKTRACKER_KEY_PASSWORD").get()
        }
    }
}
```

Keep the `signingConfig = signingConfigs.getByName("release")` line in the
`release` build type. With the properties unset, the build produces an unsigned
APK instead of using the leaked key.

### 3. Rotate

1. Build and sign with the **new** key: `cd android && ./gradlew assembleRelease`.
2. Distribute it per the scenarios above.
3. Retire the old key: delete your local `tasktracker.keystore` once nothing depends on
   it, and remove the old fingerprint anywhere it was registered (Play Console,
   Firebase, API-key restrictions).

### 4. Untrack the sensitive files

This stops git tracking them and **keeps your local copies**:

```bash
cd tools/task-tracker/android

git rm --cached tasktracker.keystore local.properties
git rm -r --cached .gradle app/build

cat >> .gitignore <<'EOF'
# Signing material - never commit
*.keystore
*.jks
keystore.properties
local.properties

# Build output / caches
.gradle/
build/
app/build/
*.apk
*.aab
EOF

git add .gitignore
git commit -m "android: untrack signing key and build artifacts"
git push
```

### 5. Untracking does not undo the leak

`git rm --cached` only affects **future** commits. The keystore, the old
passwords and the APK **remain in git history and are already public**, so
**rotation (steps 1-3) is the real fix**; untracking just prevents a repeat.
To also scrub history (cosmetic; assume the key was already copied):

```bash
# Run on a fresh clone. Requires: pip install git-filter-repo
git filter-repo --invert-paths \
  --path tools/task-tracker/android/tasktracker.keystore \
  --path tools/task-tracker/android/local.properties \
  --path tools/task-tracker/android/.gradle \
  --path tools/task-tracker/android/app/build
git push --force --all
```

This rewrites history and breaks other clones, which must re-clone.
