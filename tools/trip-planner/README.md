# Trip Planner

A multi-city trip planner that runs entirely in the browser. Inspired by Wanderlog and TripIt.

## Features

- **Multi-city legs** — Organize trips into city stops with dates, reorder legs, geocode cities via Nominatim
- **Lodging & transport** — Track hotels, flights, trains, buses, ferries with booking status, confirmation numbers, and costs
- **Activities** — Categorized places (food, sightseeing, shopping, nightlife, etc.) with date/time, duration, cost, reservation tracking, and visit status with ratings
- **Day plans** — Group and order activities for specific days, assign floating plans to dates, drag-and-drop reordering
- **Option groups** — Create alternative activity groups (e.g. "Lunch spots") where picking one dims the others
- **Pool activities** — Mark activities as available any day within a leg
- **Itinerary view** — Day-by-day timeline with ordered/unordered modes, real-time sorting (upcoming → unscheduled → dismissed → visited), filtering by leg/category/status
- **Smart Paste** — Paste booking confirmation emails to auto-extract dates, times, confirmation codes, carriers, and addresses
- **Reservations view** — All bookable items grouped by type with prominent confirmation numbers (tap to copy)
- **Interactive map** — Leaflet/OpenStreetMap with color-coded markers, OSRM driving routes between day plan stops, travel time labels, filtering by leg/day/category
- **Dashboard** — Trip overview with booking progress bars, budget summary by category and currency, top action items
- **Action items** — Phased checklist (Plan → Book Lodging → Book Transport → Book Activities → Prepare) with progress tracking
- **Packing list** — Categorized checklist with pack/unpack toggles
- **Export/Import** — Full data or single-trip JSON export/import with ID regeneration on duplicate import
- **ICS calendar export** — Generate .ics files with transport, lodging, and activity events
- **GPX export** — Export visible map items as GPX waypoints and routes for OsmAnd/OSM apps
- **Encryption** — Optional AES-256-GCM encryption (PBKDF2 600K iterations) for sensitive fields (confirmation numbers, booking platforms, phone numbers)
- **Sensitive data modes** — Restricted (hidden), unrestricted (visible), or encrypted
- **Dark mode** — Full light/dark theme support
- **Responsive** — Desktop top tabs, mobile bottom nav with safe-area-inset support
- **Zero dependencies** — Single HTML file, vanilla JS, no build step. All data in localStorage

## Data Storage

All trip data is stored in `localStorage` under `trip-planner-local-v1` (or `trip-planner-hosted-v1` when served from a domain). Settings are stored separately under `trip-planner-settings-v1`.

## External Services

- **OpenStreetMap** tiles for the map
- **Nominatim** for city/place geocoding (rate-limited to 1 req/sec)
- **OSRM** for driving route geometry between stops
- **Leaflet.js 1.9.4** loaded from CDN

No data is sent to any server other than the geocoding/routing queries above.
