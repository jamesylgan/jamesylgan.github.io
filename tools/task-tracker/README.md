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
- **Progress Tracking** — Per-group and overall progress bars

### Organization
- **Archive** — Archive completed tasks or entire groups
- **Trash** — Deleted items go to trash for 30 days before permanent removal
- **Configurable Dismiss Actions** — Choose between delete, archive, or both buttons per task
- **Inline Delete Confirmations** — Red Yes / white No confirmation on all delete actions

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
