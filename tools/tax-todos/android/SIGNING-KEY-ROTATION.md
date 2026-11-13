# Android signing key: rotation and untracking guide

> **Note: the key used for local development was pushed to this repo.**
> `taxtodos.keystore` (plus its passwords in `app/build.gradle.kts`) was committed
> to a public repository. Treat it as **compromised**. It is fine for local
> debugging only. **For any real release, rotate the key first** (how to generate
> and rotate it is below), and **untrack the key files** with the commands in
> [Step 4](#4-untrack-the-sensitive-files).

## What is exposed

| File (under `tools/tax-todos/android/`) | Why it matters |
|---|---|
| `taxtodos.keystore` | The signing key. Anyone can sign an APK that Android treats as an update to this app. |
| `app/build.gradle.kts` (lines ~17-24) | Keystore path, alias **and both passwords** are hardcoded. |
| `app/build/outputs/apk/release/app-release.apk` | A signed release build is committed. |
| `local.properties` | Machine-specific SDK path. Not secret, but should never be tracked. |
| `.gradle/`, `app/build/` | Build caches and intermediates. Noise, and should never be tracked. |

Package name: `tech.bellevue.taxtodos`.

## Read this first: what rotation does to existing installs

- **Sideloaded APKs:** Android refuses to update an app signed with a different
  key. Users must uninstall and reinstall. Uninstalling **deletes the app's local
  data** (checklist, notes, settings, accounts all live in the WebView's
  `localStorage`). Ask users to use **Settings -> Export JSON** first and
  **Import** afterwards.
- **Google Play with Play App Signing:** you only reset the *upload* key (Play
  Console -> App integrity -> App signing -> Request upload key reset). Users
  are not affected.
- **Google Play without Play App Signing, or a published app signed with this
  key:** Play does not allow changing the app signing key for an existing
  listing. Enrol in Play App Signing; if that is not possible, publish under a new
  package name.
- If this app has **never been released** (only local/debug use), simply
  generate a new key, untrack the old one, and skip the migration concerns.

## 1. Generate a new keystore (outside the repo)

Keep it out of the working tree, for example in `~/.android-keys/`:

```bash
mkdir -p ~/.android-keys && chmod 700 ~/.android-keys

keytool -genkeypair -v \
  -keystore ~/.android-keys/taxtodos-release.jks \
  -alias taxtodos \
  -keyalg RSA -keysize 4096 -validity 10000 \
  -storetype PKCS12

chmod 600 ~/.android-keys/taxtodos-release.jks
```

- Pick a **strong, unique password** (a password manager is ideal). Do not reuse
  the old one.
- **Back up** the `.jks` and its password somewhere safe and private. If you lose
  it you cannot ship updates under that key.
- Get the new certificate fingerprint for your records (and for Play, if used):

```bash
keytool -list -v -keystore ~/.android-keys/taxtodos-release.jks -alias taxtodos
```

## 2. Stop hardcoding credentials

Put the secrets in your **user-level** Gradle properties, which live outside the
repo. Edit `~/.gradle/gradle.properties`:

```properties
TAXTODOS_STORE_FILE=/Users/<you>/.android-keys/taxtodos-release.jks
TAXTODOS_STORE_PASSWORD=<new password>
TAXTODOS_KEY_ALIAS=taxtodos
TAXTODOS_KEY_PASSWORD=<new password>
```

Then replace the hardcoded `signingConfigs` block in `app/build.gradle.kts`:

```kotlin
signingConfigs {
    create("release") {
        val storePath = providers.gradleProperty("TAXTODOS_STORE_FILE").orNull
        if (storePath != null) {
            storeFile = file(storePath)
            storePassword = providers.gradleProperty("TAXTODOS_STORE_PASSWORD").get()
            keyAlias = providers.gradleProperty("TAXTODOS_KEY_ALIAS").get()
            keyPassword = providers.gradleProperty("TAXTODOS_KEY_PASSWORD").get()
        }
    }
}
```

Keep the existing `signingConfig = signingConfigs.getByName("release")` line in
the `release` build type. Without the properties set, the build simply produces an
unsigned release APK instead of using a leaked key.

## 3. Rotate

1. Build and sign a release with the **new** key: `./gradlew assembleRelease`.
2. Distribute it according to the scenarios in "Read this first" above.
3. **Retire the old key:** delete your local copy of `taxtodos.keystore` once no
   install or listing depends on it. If the old key was ever registered anywhere
   (Play Console, Firebase, API key restrictions that use the SHA-1 fingerprint),
   remove or replace that fingerprint there.

## 4. Untrack the sensitive files

This stops git from tracking them while **keeping your local copies**:

```bash
cd tools/tax-todos/android

git rm --cached taxtodos.keystore local.properties
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

## 5. Understand what untracking does *not* do

`git rm --cached` only removes the files from **future** commits. The keystore,
the passwords in old versions of `app/build.gradle.kts`, and the APK **remain in
git history and are already public.** Treat the old key as burned regardless:
**rotation (steps 1-3) is the actual fix.** Untracking just prevents a repeat.

If you also want to scrub history (cosmetic; the key is still compromised, and
forks or clones may already have it):

```bash
# Requires: pip install git-filter-repo   (run on a fresh clone)
git filter-repo --invert-paths \
  --path tools/tax-todos/android/taxtodos.keystore \
  --path tools/tax-todos/android/local.properties \
  --path tools/tax-todos/android/.gradle \
  --path tools/tax-todos/android/app/build
git push --force --all
```

This rewrites history and breaks other clones; anyone else must re-clone. Because
the repository is public, assume the old key was already copied.
