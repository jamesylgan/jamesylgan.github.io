# Furniture Planner

A client-side web tool (see `index.html`). An Android wrapper lives in `android/`.

## Android app: signing key was committed (rotate before any release)

> **Note: the key for local development was pushed to this repo.**
> `android/furnitureplanner.keystore` (plus both of its passwords, hardcoded in
> `android/app/build.gradle.kts`, and a signed `app-release.apk`) was committed
> to a public repository. Treat the key as **compromised**. It is fine for local
> debugging only. **For any real release, rotate the key first** (how to generate
> and rotate it is below), and **untrack the key files** with the commands in
> [step 4](#4-untrack-the-sensitive-files).

Package name: `tech.bellevue.furnitureplanner`.

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
  -keystore ~/.android-keys/furnitureplanner-release.jks \
  -alias furnitureplanner \
  -keyalg RSA -keysize 4096 -validity 10000 \
  -storetype PKCS12

chmod 600 ~/.android-keys/furnitureplanner-release.jks
```

Use a strong, unique password (do not reuse the old one) and **back up** the
`.jks` and its password privately; losing it means you cannot ship updates under
that key. Record the new fingerprint:

```bash
keytool -list -v -keystore ~/.android-keys/furnitureplanner-release.jks -alias furnitureplanner
```

### 2. Stop hardcoding credentials

Put the secrets in your **user-level** `~/.gradle/gradle.properties` (outside the
repo):

```properties
FURNITUREPLANNER_STORE_FILE=/Users/<you>/.android-keys/furnitureplanner-release.jks
FURNITUREPLANNER_STORE_PASSWORD=<new password>
FURNITUREPLANNER_KEY_ALIAS=furnitureplanner
FURNITUREPLANNER_KEY_PASSWORD=<new password>
```

Then replace the hardcoded `signingConfigs` block in
`android/app/build.gradle.kts`:

```kotlin
signingConfigs {
    create("release") {
        val storePath = providers.gradleProperty("FURNITUREPLANNER_STORE_FILE").orNull
        if (storePath != null) {
            storeFile = file(storePath)
            storePassword = providers.gradleProperty("FURNITUREPLANNER_STORE_PASSWORD").get()
            keyAlias = providers.gradleProperty("FURNITUREPLANNER_KEY_ALIAS").get()
            keyPassword = providers.gradleProperty("FURNITUREPLANNER_KEY_PASSWORD").get()
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
3. Retire the old key: delete your local `furnitureplanner.keystore` once nothing depends on
   it, and remove the old fingerprint anywhere it was registered (Play Console,
   Firebase, API-key restrictions).

### 4. Untrack the sensitive files

This stops git tracking them and **keeps your local copies**:

```bash
cd tools/furniture-planner/android

git rm --cached furnitureplanner.keystore local.properties
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
  --path tools/furniture-planner/android/furnitureplanner.keystore \
  --path tools/furniture-planner/android/local.properties \
  --path tools/furniture-planner/android/.gradle \
  --path tools/furniture-planner/android/app/build
git push --force --all
```

This rewrites history and breaks other clones, which must re-clone.
