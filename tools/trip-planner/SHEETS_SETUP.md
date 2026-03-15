# Google Sheets Sync Setup

Share trips with travel partners by syncing to a Google Sheet. One person edits, others pull the latest.

## Prerequisites

- A Google account
- 5 minutes for one-time setup

## Step 1: Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it anything (e.g. "Trip Planner") → **Create**
4. Make sure the new project is selected in the dropdown

## Step 2: Enable the Google Sheets API

1. Go to **APIs & Services → Library** (left sidebar)
2. Search for **Google Sheets API**
3. Click it → **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Select **External** → **Create**
3. Fill in:
   - App name: anything (e.g. "Trip Planner")
   - User support email: your email
   - Developer contact: your email
4. Click **Save and Continue** through the remaining steps
5. Under **Test users**, add the Google emails of everyone who will use the sync
6. **Publish the app** if you want to skip the test user requirement (optional)

## Step 4: Create OAuth Client ID

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: anything (e.g. "Trip Planner Web")
5. **Authorized JavaScript origins** — add:
   - `https://bellevue.tech` (for the hosted app)
   - `http://localhost` (for local development)
   - `http://localhost:8000` (if using a dev server on port 8000)
6. **Authorized redirect URIs** — add:
   - `https://bellevue.tech/tools/trip-planner/oauth-callback` (required for the Android app)
7. Click **Create**
8. Copy the **Client ID** (looks like `xxxxxxxxxxxx.apps.googleusercontent.com`)

## Step 5: Configure Trip Planner

1. Open Trip Planner (browser or Android app)
2. Go to **Settings** (gear icon)
3. Toggle **Google Sheets Sync** on
4. Paste your **Client ID** into the input field

## Usage

### Sharing a trip

1. Create a Google Sheet at [sheets.google.com](https://sheets.google.com)
2. Share it with your travel partner(s) (Editor access for read/write, Viewer for read-only)
3. In Trip Planner, go to the trips list and click **Import from Sheets**
4. Paste the Google Sheets URL
5. If the sheet is empty, choose a local trip to push to it
6. If the sheet already has trip data, it will be imported

### Syncing

- **Auto-push**: When you edit a trip that's linked to a sheet, changes push automatically after 2 seconds (only while signed in)
- **Manual sync**: Click the 🔄 button in the trip header to pull/push
- **Pull**: If the remote version is newer, you'll be asked whether to replace your local data

### On Android

- Google sign-in opens in your phone's browser (Chrome)
- After signing in, you'll be redirected back to the app
- If you see an "Open with" dialog, select **Trip Planner**

### Signing out

- Go to **Settings** → the signed-in email is shown under the Client ID field → click **Sign Out**

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Set Google Client ID in Settings first" | Paste your Client ID in Settings |
| "You don't have access to this sheet" | The sheet owner needs to share it with your Google account |
| "You don't have write access" | Ask the sheet owner to give you **Editor** access (not Viewer) |
| "Session expired" | Click sync — you'll be prompted to sign in again (tokens last ~1 hour) |
| "Sheet not found" | Check the URL is correct and the sheet hasn't been deleted |
| "Trip data too large" | Trip JSON exceeds 50KB (the Google Sheets cell limit). Try removing photos or trimming notes |
| OAuth popup blocked (browser) | Allow popups for the site, then try again |
| Android redirect doesn't come back to app | In Android Settings → Apps → Trip Planner → Open by default → add `bellevue.tech` |

## How It Works

- Trip data is stored as JSON in cell A1 of Sheet1
- The format is the same as `.trip` file exports: `{ version, format, exportedAt, trip }`
- Sharing is standard Google Sheets sharing — invite by email
- Auth is client-side only (OAuth implicit grant for browser, PKCE auth code flow for Android)
- No data passes through any server besides Google's APIs
- Conflict resolution: last writer wins, with a prompt when pulling newer remote data
