# Trip Planner - Component Interface Spec

## Subagent Instructions

You are writing a block of JS functions for the Trip Planner tool. Your output will be inserted into a `<script>` tag in `index.html`. Write ONLY the functions listed for your phase — no HTML, no CSS, no boilerplate.

**Rules:**
- All functions are global (no modules, no classes)
- Use `esc(str)` for any user-provided text rendered as HTML
- Use `onclick="fnName('escaped-id')"` for event handlers in rendered HTML
- Render views by setting `document.getElementById('mainContent').innerHTML = ...`
- Use `openModal(htmlString)` / `closeModal()` for modal dialogs
- Use `showConfirm(title, message).then(ok => ...)` for destructive confirmations
- Use `save()` after any data mutation, `saveSetting()` after settings changes
- Use `getTrip()` to get the current trip (uses `state.tripId`)
- Use `isSensitiveAllowed()` before rendering confirmation number / ticket fields
- Use `sensitiveFieldHTML(label, value, inputId, placeholder)` for sensitive form fields
- Call `render()` after navigation state changes
- Do NOT re-declare any variables/functions from the core (they're already global)
- Nominatim: `https://nominatim.openstreetmap.org/search?format=json&q=QUERY&limit=5` (1 req/sec, debounce)
- OSRM: `https://router.project-osrm.org/route/v1/driving/LNG1,LAT1;LNG2,LAT2?overview=full&geometries=geojson`

**Output format:** Pure JavaScript functions, ready to paste. Include a comment header like:
```javascript
// === PHASE X: DESCRIPTION ===
```

## Global State (available to all components)

```javascript
// Storage keys
const isLocal = location.protocol === 'file:';
const STORAGE_KEY = isLocal ? 'trip-planner-local-v1' : 'trip-planner-hosted-v1';
const SETTINGS_KEY = 'trip-planner-settings-v1';

// Data
let data = { trips: [] };        // All trip data
let settings = { ... };          // User settings
let cryptoKey = null;             // AES key (memory only)
let map = null;                   // Leaflet map instance

// Navigation state
let state = {
    view: 'trips',                // 'trips' | 'trip'
    tripId: null,                 // Current trip ID
    tripTab: 'dashboard',        // 'dashboard'|'itinerary'|'reservations'|'map'|'actions'
    editingId: null,              // ID of item in modal
    editingType: null,            // 'trip'|'leg'|'lodging'|'transport'|'activity'|'dayPlan'|'optionGroup'
    itineraryMode: 'ordered',    // 'ordered' | 'unordered'
    itineraryFilter: { legId: null, category: null, status: null },
    mapFilter: { legId: null, dayPlanId: null, category: null },
    collapsedDays: {},            // { 'YYYY-MM-DD': true }
    dismissedActivities: new Set(),
};
```

## Constants

```javascript
const CATEGORIES = { museum:'🏛️', restaurant:'🍽️', tour:'🚶', shopping:'🛍️', nature:'🌿', nightlife:'🌙', landmark:'📍', other:'📌' };
const TRANSPORT_TYPES = { flight:'✈️', train:'🚆', bus:'🚌', car:'🚗', ferry:'⛴️', other:'🚐' };
const TRIP_STATUSES = { planning:'Planning', booking:'Booking', ready:'Ready', 'in-progress':'In Progress', completed:'Completed' };
const STATUS_COLORS = { planning:'var(--accent)', booking:'var(--warning)', ready:'var(--success)', 'in-progress':'var(--purple)', completed:'var(--text-muted)' };
const CURRENCIES = ['USD','EUR','GBP','JPY','CNY','KRW','AUD','CAD','CHF','MXN','BRL','INR','THB','VND','TWD','HKD','SGD','NZD','SEK','NOK','DKK','PLN','CZK','HUF','TRY','ZAR','ILS','AED'];
```

## Encryption / Sensitive Data (provided by core)

3-mode `settings.sensitiveDataMode`:
- `'restricted'` (default): Sensitive fields blocked. `isSensitiveAllowed()` returns false.
- `'unrestricted'`: All fields available, no encryption.
- `'encrypted'`: All fields available, AES-256-GCM encrypted with passphrase.

```javascript
isSensitiveAllowed()                           // true unless mode is 'restricted'
sensitiveFieldHTML(label, value, inputId, placeholder)  // returns form field or blocked message
```

Sensitive fields: confirmationNumber, bookingPlatform (on lodging and transport), seatInfo, phone.
When rendering these in forms, always use `sensitiveFieldHTML()`.
When rendering these in read-only views (cards, lists), check `isSensitiveAllowed()` — if false, show "***" or omit.

## Utility Functions (provided by core)

```javascript
uid()                              // Returns unique ID like 'x7f3k9m2'
esc(str)                           // HTML-escape a string
toast(msg)                         // Show toast notification
formatDate(dateStr)                // Format date per settings.dateFormat
formatTime(timeStr)                // Format time per settings.timeFormat
formatCurrency(amount, currency)   // Format currency amount
formatDuration(minutes)            // "2h 30m" or "45m"
formatDateRange(start, end)        // "Jun 1 - Jun 4"
daysBetween(d1, d2)                // Number of days between two date strings
getTrip(tripId)                    // Get trip by ID (defaults to state.tripId)
save()                             // Save data to localStorage (handles encryption)
saveSetting()                      // Save settings to localStorage
isSensitiveAllowed()               // true if sensitiveDataMode != 'restricted'
```

## DOM Structure

```html
<div id="app">
  <header id="appHeader"></header>   <!-- Rendered by renderHeader() -->
  <main id="mainContent"></main>     <!-- Rendered by current view function -->
  <nav id="bottomNav"></nav>         <!-- Rendered by renderBottomNav() -->
</div>

<div class="modal-overlay" id="modalOverlay">
  <div class="modal" id="modalBody"></div>
</div>

<div class="modal-overlay" id="confirmOverlay">
  <div class="modal modal-sm" id="confirmBody"></div>
</div>

<div class="toast" id="toast"></div>
```

## Modal System

```javascript
// Open a modal with dynamic HTML content
openModal(htmlContent)             // Sets modalBody.innerHTML, shows overlay
closeModal()                       // Hides modal overlay

// Confirm dialog (returns Promise<boolean>)
confirm(title, message)            // Shows confirm dialog, resolves true/false

// For sensitive fields in forms:
sensitiveFieldHTML(label, value, inputId, placeholder)
// Returns either the input field or a "restricted" message based on settings
```

## Rendering Pattern

Each view function renders into `#mainContent`:

```javascript
function renderMyView() {
    const trip = getTrip();
    const mc = document.getElementById('mainContent');
    mc.innerHTML = `<div class="view-content">...</div>`;
    // Optional: attach event listeners after rendering
}
```

Use `onclick="functionName(args)"` in rendered HTML for event handlers.
All function names are global. Use `esc()` for any user-provided text in HTML.

## Render Dispatch (in core)

```javascript
function render() {
    renderHeader();
    if (state.view === 'trips') {
        renderTripsList();
        hideBottomNav();
    } else {
        renderBottomNav();
        switch (state.tripTab) {
            case 'dashboard': renderDashboard(); break;
            case 'itinerary': renderItinerary(); break;
            case 'reservations': renderReservations(); break;
            case 'map': renderMapView(); break;
            case 'actions': renderActionItems(); break;
        }
    }
}
```

## CSS Classes Available

### Layout
- `.view-content` - padded content wrapper
- `.view-header` - section header with title + actions
- `.scroll-x` - horizontal scroll container

### Cards
- `.card` - white card with shadow and radius
- `.card-header` - flex row with title + actions
- `.card-body` - padded card content

### Buttons
- `.btn` - base button (38px height)
- `.btn-primary` - accent colored
- `.btn-danger` - red
- `.btn-ghost` - transparent, text color
- `.btn-sm` - smaller button
- `.btn-icon` - 32x32 icon button
- `.fab` - floating action button (bottom right)

### Forms
- `.form-group` - label + input wrapper (margin-bottom: 12px)
- `.form-row` - flex row for side-by-side groups
- `.input` - styled input
- `.select` - styled select
- `.textarea` - styled textarea
- `.toggle-wrap` - label + toggle switch
- `.segmented` - segmented control wrapper
- `.segmented-btn` - individual segment
- `.segmented-btn.active` - active segment

### Status
- `.badge` - small status badge
- `.badge-{status}` - colored by trip status
- `.unbooked` - warning highlight for unbooked items
- `.visited` - muted style for visited items
- `.dimmed` - dimmed option group alternative

### Lists
- `.item-list` - list container
- `.item-row` - single item with flex layout
- `.item-row .item-check` - checkbox area
- `.item-row .item-body` - main content
- `.item-row .item-actions` - action buttons
- `.drag-handle` - drag affordance

### Specific
- `.trip-card` - trip list card
- `.day-card` - itinerary day card
- `.day-card-header` - collapsible day header
- `.leg-chip` - city chip in timeline
- `.leg-chip.active` - highlighted leg
- `.stat-box` - dashboard stat
- `.progress-bar` - progress bar wrapper
- `.progress-fill` - progress bar fill
- `.confirmation-code` - monospace, user-select:all
- `.sensitive-blocked` - message when sensitive data restricted
- `.rating` - star rating widget
- `.category-icon` - category emoji display
- `.timeline` - horizontal leg timeline
- `.filter-bar` - row of filter controls

### Map
- `#mapContainer` - Leaflet map div (height: 400px)
- `.map-wrapper` - map + controls container

## Data Model Reference

### Trip
```javascript
{ id, name, status, startDate, endDate, currency, notes, createdAt, updatedAt,
  legs:[], dayPlans:[], lodging:[], transport:[], activities:[], optionGroups:[], packingList:[] }
```

### Leg
```javascript
{ id, city, country, startDate, endDate, coordinates:{lat,lng}, order, notes }
```

### Lodging
```javascript
{ id, legId, name, address, coordinates:{lat,lng}, checkIn, checkOut,
  confirmationNumber, bookingPlatform, cost, currency, booked, notes, phone }
```

### Transport
```javascript
{ id, type, fromLegId, toLegId, fromCity, toCity, carrier, flightNumber,
  departure, arrival, confirmationNumber, bookingPlatform, seatInfo,
  cost, currency, booked, notes }
```

### Activity
```javascript
{ id, legId, name, category, address, coordinates:{lat,lng}, date, time,
  duration, cost, currency, reservationNeeded, booked, visited, visitedAt,
  rating, optionGroupId, isPooled, isFixed, osmLink, notes, url, order }
```

### DayPlan
```javascript
{ id, legId, name, assignedDate, activityIds:[], notes, order }
```

### OptionGroup
```javascript
{ id, legId, name }
```

### PackingItem
```javascript
{ id, item, category, packed, quantity }
```

## Functions Each Phase Must Implement

### Phase A: Legs + Dashboard + Action Items
- `renderLegTimeline(trip)` → HTML string for horizontal leg chips
- `openLegModal(legId)` → opens modal to create/edit leg
- `saveLeg()` → saves leg from modal form
- `deleteLeg(legId)` → deletes with confirm
- `reorderLegs(tripId, legId, direction)` → move leg left/right
- `searchCity(query)` → Nominatim geocoding, returns results for autocomplete
- `renderDashboard()` → renders into #mainContent
- `computeBudget(trip)` → { total, byCategory, byCurrency }
- `computeProgress(trip)` → { bookedLodging, totalLodging, bookedTransport, totalTransport, ... }
- `computeActionItems(trip)` → [{ text, type, action }]
- `renderActionItems()` → renders into #mainContent

### Phase B: Lodging + Transport + Reservations View
- `openLodgingModal(lodgingId)` → opens modal
- `saveLodging()` → saves from form
- `deleteLodging(id)` → deletes with confirm
- `toggleLodgingBooked(id)` → quick toggle
- `openTransportModal(transportId)` → opens modal
- `saveTransport()` → saves from form
- `deleteTransport(id)` → deletes with confirm
- `toggleTransportBooked(id)` → quick toggle
- `copyConfirmation(text)` → copy to clipboard + toast
- `renderReservations()` → renders into #mainContent

### Phase C: Activities + Day Plans + Option Groups
- `openActivityModal(activityId)` → opens modal
- `saveActivity()` → saves from form
- `deleteActivity(id)` → deletes with confirm
- `toggleActivityVisited(id)` → toggle visited + set visitedAt
- `rateActivity(id, rating)` → set 1-5 rating
- `openDayPlanModal(dayPlanId)` → opens modal
- `saveDayPlan()` → saves from form
- `deleteDayPlan(id)` → deletes with confirm
- `assignDayPlan(dpId, date)` → assign floating plan to a date
- `openOptionGroupModal(ogId)` → opens modal
- `saveOptionGroup()` → saves from form
- `deleteOptionGroup(id)` → deletes with confirm
- `searchPlace(query)` → Nominatim search for activity address

### Phase D: Itinerary View + Smart Paste
- `renderItinerary()` → renders into #mainContent
- `getDayRange(trip)` → array of date strings from trip start to end
- `getEventsForDate(trip, dateStr)` → { transport, lodging, activities, dayPlans }
- `getLegForDate(trip, dateStr)` → leg object or null
- `toggleDayCollapsed(dateStr)` → collapse/expand day card
- `dismissActivity(actId)` → add to dismissed set
- `undismissActivity(actId)` → remove from dismissed set
- `reorderDayActivities(dayPlanId, fromIdx, toIdx)` → drag-drop reorder
- `openSmartPaste()` → opens smart paste modal
- `parseBookingText(text)` → extract fields from pasted text
- `saveSmartPasteResult()` → save parsed item

### Phase E: Map View
- `renderMapView()` → renders into #mainContent, initializes Leaflet
- `initMap()` → create Leaflet map instance
- `updateMapMarkers()` → add/update markers based on filters
- `updateMapRoutes()` → draw route lines between ordered stops
- `fitMapBounds()` → fit map to visible markers
- `exportGPX()` → download GPX file of current view
- `getOSRMRoute(coords)` → fetch route from OSRM API
