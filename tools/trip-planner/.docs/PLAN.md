# Trip Planner Tool - Implementation Plan

## Status: In Progress

## Execution Strategy

### Approach: Core file + parallel subagents

1. **Step 1**: Write `index.html` with HTML + CSS + Core JS + Trip CRUD (the foundation). This includes:
   - All HTML structure (app shell, modal overlays, toast, file input)
   - All CSS (~600 lines covering every component)
   - Core JS: utilities, state management, navigation, encryption, settings, export/import, trip list + trip CRUD
   - Stub functions for each view (return placeholder HTML)
   - The file should be immediately runnable and show a working trips list

2. **Step 2**: Launch 5 subagents in parallel, each writing to a separate `.js` file:
   - **Subagent A** → `phase-a.js`: Legs + Dashboard + Action Items
   - **Subagent B** → `phase-b.js`: Lodging + Transport + Reservations View
   - **Subagent C** → `phase-c.js`: Activities + Day Plans + Option Groups
   - **Subagent D** → `phase-d.js`: Itinerary View + Smart Paste
   - **Subagent E** → `phase-e.js`: Map View (Leaflet, OSRM, GPX export)

3. **Step 3**: Read each `.js` file and insert its functions into `index.html`, replacing the stubs.

4. **Step 4**: Add trip planner card to `/tools/index.html`

5. **Step 5**: Delete the temp `.js` files, update PLAN.md checkboxes

Each subagent receives:
- The INTERFACE.md file (global state, utilities, CSS classes, data model, function signatures)
- The PLAN.md (for context on what each phase covers)
- Instructions to write ONLY the JS functions listed for their phase
- Instructions to use `esc()` for user text, `onclick` handlers, render into `#mainContent`

### Encryption: 3-Mode Sensitive Data Toggle

Setting: `settings.sensitiveDataMode` with 3 values:
- **`'restricted'`** (DEFAULT): No encryption. Confirmation codes, ticket numbers, booking reference fields are **disabled/hidden** in forms. A message says "Enable encryption or unrestricted mode in Settings to store sensitive booking data." This prevents accidentally storing sensitive data in plaintext localStorage.
- **`'unrestricted'`**: No encryption. All fields available. User accepts the risk of plaintext storage.
- **`'encrypted'`**: Full AES-256-GCM encryption with passphrase (PBKDF2 key derivation, 600K iterations, random salt + IV). All fields available. Data encrypted before saving to localStorage. Passphrase required on each app load.

Implementation follows task tracker pattern:
- `deriveKey(passphrase, salt)` → PBKDF2 → AES-GCM-256 key
- `encryptData(plaintext, key)` → { iv, ct } (base64)
- `decryptData(encrypted, key)` → plaintext
- `saveEncrypted()` → encrypts JSON, stores `{ encrypted: true, salt, iv, ct }`
- `loadEncrypted(passphrase)` → derives key, decrypts, returns data
- `cryptoKey` kept in memory only, never persisted
- Salt stored in `STORAGE_KEY + '-salt'`
- Passphrase modal with setup mode (confirm) and decrypt mode
- Helper: `isSensitiveAllowed()` returns `settings.sensitiveDataMode !== 'restricted'`
- Helper: `sensitiveFieldHTML(label, value, inputId, placeholder)` returns input or blocked message

Settings UI uses a 3-way segmented control (not a toggle):
```
[ Restricted (default) ] [ Unrestricted ] [ Encrypted ]
```
Switching to "Encrypted" opens the passphrase setup modal. Switching away from "Encrypted" decrypts and saves plaintext (with confirmation).

## Context
Building a TripIt + Wanderlog style trip planner as a new tool in the `/tools` directory. The tool helps plan multi-city trips, track reservations (hotels, flights, trains), checklist activities as you visit them, and integrates OpenStreetMap for map views and route lines. Follows all existing conventions (single `index.html`, vanilla JS, localStorage, CSS variables, dark mode).

## Key Concepts

- **Legs** = city stops (e.g., "3 nights in Madrid"). The trip skeleton.
- **Day Plans** = proposed daily itineraries within a leg. Can be **floating** (not tied to a specific date) or **assigned** to a date. E.g., "3 day-plans for a 3-day city stay" -- pick which one to activate each morning.
- **Activities** can be **scheduled** (on a specific day plan or date), **pooled** (available to any day in a leg -- e.g., a restaurant you might visit any day), or **fixed** (tied to a specific date/time, e.g., a timed museum reservation).
- **Option Groups** = alternatives. E.g., 5 possible restaurants -- when you visit one, the others dim/hide from that day. Pool items used in one day plan disappear from others.
- **Smart Paste** = paste confirmation text -> auto-extract dates, locations, confirmation codes into a new item.

## Data Model

**Core structure** stored under `trip-planner-{local|hosted}-v1`:

```
data = {
  trips: [{
    id, name, status (planning|booking|ready|in-progress|completed),
    startDate, endDate, currency, notes, createdAt, updatedAt,

    legs: [{                        // City stops
      id, city, country, startDate, endDate, coordinates, order, notes
    }],

    dayPlans: [{                    // Proposed daily itineraries
      id, legId, name,              // e.g. "Day Plan A" for Madrid
      assignedDate: null|'2026-06-02',  // null = floating, set when activated
      activityIds: ['act_xxx'],     // ordered list of activities for this plan
      notes, order
    }],

    lodging: [{                     // Hotels per leg
      id, legId, name, address, coordinates, checkIn, checkOut,
      confirmationNumber, bookingPlatform, cost, currency, booked,
      notes, phone
    }],

    transport: [{                   // Flights/trains between legs
      id, type (flight|train|bus|car|ferry|other), fromLegId, toLegId,
      fromCity, toCity, carrier, flightNumber, departure, arrival,
      confirmationNumber, bookingPlatform, seatInfo, cost, currency,
      booked, notes
    }],

    activities: [{                  // Places to visit
      id, legId, name, category (museum|restaurant|tour|shopping|nature|
      nightlife|landmark|other), address, coordinates, date, time,
      duration, cost, currency, reservationNeeded, booked, visited,
      osmLink, notes, url, order,
      rating: null|1-5,            // Post-visit rating
      optionGroupId: null|'og_xx', // If set, alternatives to each other
      isPooled: false,             // true = available to any day in this leg
      isFixed: false,              // true = must happen on specific date (timed reservation)
      visitedAt: null              // ISO timestamp when marked visited
    }],

    optionGroups: [{               // Named groups of alternatives
      id, legId, name              // e.g. "Lunch spots", "Day 2 route options"
    }],

    packingList: [{                 // Optional
      id, item, category, packed, quantity
    }]
  }]
}
```

**Settings** under `trip-planner-settings-v1`: darkMode, sensitiveDataMode ('restricted'|'unrestricted'|'encrypted'), defaultCurrency, dateFormat, timeFormat, mapDefaultZoom, showPackingList, showBudget, accentColor, showTravelTimes.

## Views (5 trip-level tabs + trips list)

1. **Trips List** (landing) - Cards with status badges, progress, action item count
2. **Dashboard** - Timeline, booking progress bars, budget summary, top action items
3. **Itinerary** - Day-by-day view with real-time awareness (see below). Supports:
   - **Ordered mode**: day plans with timed route through activities, drag-drop reorder
   - **Unordered mode**: pooled/map-based view of all places for a leg (no sequence)
   - Filtering by category, booked/unbooked, visited/unvisited
   - Option groups shown as expandable "pick one" cards
   - Smart paste button to add items from clipboard text
4. **Reservations** - All bookings grouped by type, unbooked highlighted, prominent confirmation #s
5. **Map** - Leaflet.js + OSM tiles, markers + route lines (OSRM), filter by leg/day, Nominatim search, export as GPX
6. **Action Items** - Phased view: plan cities -> book lodging -> book transport -> book activities -> prepare

### Real-Time Itinerary (current day awareness)

When viewing today's itinerary, uses device time to:
- **Upcoming items**: Pinned to top, highlighted with accent color
- **Current item**: Based on scheduled time + duration, shown prominently
- **Remaining (unvisited, no specific time)**: Below upcoming, normal style
- **Visited items**: Moved to bottom of list, muted style, expandable for rating/notes
- **Dismissed items**: Items you skip -- moved below remaining but above visited

Sort order for today: upcoming (by time) -> remaining unscheduled -> dismissed -> visited

### Option Groups UX

- Activities in an option group show as a card with alternatives listed
- Tap one to "select" it for that day -- others collapse/dim
- Visiting one auto-dims others across all day plans
- Pool items used in one day plan are hidden from other day plans
- Can still un-visit to restore alternatives

## External Dependencies

- **Leaflet.js 1.9.4** from CDN (CSS + JS) - map tiles + markers + polylines
- **Nominatim API** (OSM geocoding) - free, no API key, 1 req/sec (debounced)
- **OSRM API** (routing) - free, no API key, for travel time estimates + route lines between stops

## Navigation

- Top-level: trips list vs single trip view
- Trip-level: desktop = top tabs, mobile = bottom nav bar (5 icons)
- State-driven: `currentView`, `currentTripId`, `currentTripTab`

## Mobile UX

- Bottom tab navigation (fixed, hidden on desktop >640px)
- Large touch targets (44px min), confirmation numbers user-select:all for easy copy
- Collapsible day cards in itinerary
- `env(safe-area-inset-bottom)` for notched phones
- Body padding-bottom to clear bottom nav
- Drag handle affordances on itinerary items

## Smart Paste (text parsing)

A "Paste Booking" button opens a textarea. User pastes confirmation email text. Parser extracts:
- **Dates**: Regex for common formats (Jun 1, 2026 / 2026-06-01 / 01/06/2026 / etc.)
- **Confirmation codes**: Uppercase alphanumeric patterns (6+ chars), labeled "Confirmation #"
- **Times**: HH:MM patterns, AM/PM variants
- **Addresses**: Lines with numbers + street keywords (St, Ave, Rd, Blvd, etc.)
- **Known keywords**: "check-in", "check-out", "flight", "train", "hotel", "booking"
- **Carrier/hotel names**: Common airline/hotel chain names

Shows extracted fields in a preview form. User reviews, corrects, selects item type (lodging/transport/activity), and saves. Not perfect -- but saves manual entry effort.

## Map Features

- **Markers**: Color-coded by type (hotel=purple, activity=red, transport=blue)
- **Route lines**: Leaflet polylines between ordered day plan stops. Uses OSRM for actual road/walking routes when available, straight lines as fallback.
- **Travel time labels**: Show estimated time between consecutive stops on the route
- **Filter**: By leg (city), by day plan, by category
- **Unordered view**: Just pins on map, no route lines -- for browsing all places in a leg
- **GPX export**: Export current map view as GPX file for OsmAnd / other OSM apps
- **Click marker -> popup** with name, time, status, "navigate" link to OSM directions

## Calendar Export (.ics)

- Export entire trip or single day as `.ics` file
- Each scheduled activity, transport, and lodging check-in/out becomes a VEVENT
- Includes location, description with confirmation numbers, coordinates
- Compatible with Google Calendar, Apple Calendar, Outlook

---

## Implementation Phases

### Phase 1: Skeleton + Core (~700 lines) → written directly in Step 1
- [ ] HTML boilerplate with meta tags, Leaflet CSS/JS CDN links
- [ ] CSS variables (light/dark), reset, base styles, buttons, cards, modals, toast, tabs, bottom nav, forms, drag-drop styles
- [ ] Core JS: uid, esc, toast, formatDate/Time/Currency, constants
- [ ] DEFAULT_DATA, DEFAULT_SETTINGS, load/save, dark mode, settings modal
- [ ] Navigation: showTripsView, openTrip, switchTripTab
- [ ] Export/import/clear all, .ics export, GPX export
- [ ] Encryption: 3-mode sensitive data toggle, passphrase modal, AES-256-GCM
- [ ] Trip list view + trip CRUD (landing page must work)

### Phase 2: Trips + Legs (~500 lines)
- [ ] renderTripsList, trip CRUD modals
- [ ] Leg CRUD modals with Nominatim geocoding
- [ ] renderTimeline (horizontal scrollable city stops on map)
- [ ] Reorder legs

### Phase 3: Dashboard (~350 lines)
- [ ] renderDashboard: timeline, booking progress bars, budget summary
- [ ] computeBudget, computeActionItems, computeTripProgress
- [ ] Action items summary (top 5)

### Phase 4: Lodging + Transport (~450 lines)
- [ ] Lodging modal (all fields), transport modal (type selector)
- [ ] Quick toggle booked status, copy confirmation number
- [ ] Render cards with status indicators
- [ ] OSRM travel time estimates between transport stops

### Phase 5: Activities + Day Plans + Option Groups (~500 lines)
- [ ] Activity modal with category, date/time, reservation status, rating
- [ ] Day plan CRUD: create, assign to date, reorder activities within
- [ ] Option groups: create group, assign activities, selection UX
- [ ] Pool vs fixed vs scheduled activity modes
- [ ] Nominatim place search (debounced) in modal
- [ ] toggleActivityVisited (checklist), auto-generate OSM link

### Phase 6: Itinerary View (~450 lines)
- [ ] getDayRange, getEventsForDate, getLegForDate
- [ ] renderDayCard: transport events, lodging events, activities with checkboxes
- [ ] Real-time sorting (upcoming/current/remaining/dismissed/visited)
- [ ] Ordered vs unordered mode toggle
- [ ] Option group cards with pick-one UX
- [ ] Filtering (category, status, booked/visited)
- [ ] Drag-drop reorder of activities within a day
- [ ] Rating widget on visited items

### Phase 7: Smart Paste (~250 lines)
- [ ] Paste textarea modal with "Parse" button
- [ ] Regex-based extraction of dates, times, confirmation codes, addresses
- [ ] Preview form with extracted fields, type selector
- [ ] Save parsed item to appropriate collection

### Phase 8: Reservations View (~250 lines)
- [ ] Grouped by type: flights, hotels, trains, reserved activities
- [ ] Unbooked highlighted with warning style
- [ ] Prominent confirmation numbers with tap-to-copy

### Phase 9: Map View (~400 lines)
- [ ] initMap, renderMap, updateMapView with leg/day filters
- [ ] Color-coded markers with popups
- [ ] Route lines via OSRM between ordered stops + travel time labels
- [ ] Unordered mode: pins only, no routes
- [ ] Place list below map, click to center
- [ ] searchPlace for adding new activities from map
- [ ] GPX export of current view

### Phase 10: Action Items View (~200 lines)
- [ ] Phased breakdown (plan -> book lodging -> transport -> activities -> prepare)
- [ ] Click action -> open relevant modal

### Phase 11: Polish (~200 lines)
- [ ] Responsive refinements, packing list, keyboard shortcuts
- [ ] Drag-drop touch support for mobile
- [ ] Calendar (.ics) export

**Total estimate: ~4,250 lines**

---

## Import/Export Schema

### Full Export (all trips + settings)

```json
{
  "version": 1,
  "format": "trip-planner-full",
  "exportedAt": "2026-03-11T10:00:00.000Z",
  "settings": { ... },
  "data": { "trips": [ ... ] }
}
```

### Single Trip Export (for sharing one trip)

```json
{
  "version": 1,
  "format": "trip-planner-single",
  "exportedAt": "2026-03-11T10:00:00.000Z",
  "trip": { ... }
}
```

### Import Behavior

- **Full export** (`format: "trip-planner-full"`): Replaces all data and settings. User is warned before overwrite.
- **Single trip** (`format: "trip-planner-single"`): Appends the trip to existing trips. If a trip with the same `id` exists, user is asked to replace or duplicate (new IDs generated).
- **Validation**: Import checks for `version` and `format` fields. Unknown versions trigger a warning. Missing required fields on trips/legs/etc. are filled with defaults.
- **ID regeneration on duplicate import**: When importing a single trip as a copy, all IDs (trip, legs, dayPlans, lodging, transport, activities, optionGroups, packing) are regenerated to avoid collisions. All ID references are remapped.
- **File extension**: `.json`

### GPX Export (for OsmAnd / OSM apps)

Export options: current leg (all places), specific day plan, or entire trip. Includes waypoints for all activities/lodging with category in `<type>`.

### Calendar Export (.ics)

Exports all scheduled items (transport departures/arrivals, lodging check-in/out, timed activities) as calendar events. Unscheduled/pooled items are excluded.

---

## Files to Create/Modify

1. **Create**: `/tools/trip-planner/index.html` - The entire tool (single file)
2. **Modify**: `/tools/index.html` - Add trip planner card to tools hub

---

## Bugs & TODOs

_Track bugs found during implementation and new feature ideas here._

### Bugs
- (none yet)

### TODOs / Future Ideas
- (none yet)

---

## Changelog

- **2026-03-11**: Initial plan created.
- **2026-03-11**: Added encryption 3-mode toggle design (restricted/unrestricted/encrypted).
- **2026-03-11**: Defined subagent execution strategy (core + 5 parallel subagents writing to temp .js files).
- **2026-03-11**: Updated INTERFACE.md with subagent instructions, encryption details, sensitive field handling.
