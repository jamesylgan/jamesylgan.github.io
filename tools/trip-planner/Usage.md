# Trip Planner — Usage Guide

A single-page trip planner for organizing multi-city trips: cities, lodging, transport, activities, day plans, and a live map — all stored locally in your browser.

---

## Quick Start

1. Click **+ New Trip**, give it a name, dates, budget target, and optionally set your Starting/Ending Location (searchable with coordinates).
2. Add your cities as **legs** in the order you'll visit them. Set a leg type if needed (Home, Staying with Friend, Chill).
3. Add lodging and transport for each leg.
4. Add activities (with optional photos), create day plans, and track everything as you go.

---

## 1. Plan Your Trip

### Create a trip
- From the trips list, tap **+ New Trip**.
- Fill in the name, start/end dates, default currency, and status (planning / ongoing / completed).
- **Budget** — set a total budget target. The Dashboard will show a progress bar comparing spending against this target (green under 75%, amber 75–100%, red over 100%).
- **Starting Location** and **Ending Location** are now searchable — type a city or address and pick from OpenStreetMap results. This saves coordinates so the locations appear on the trip route on the map. If no start/end is set, dashed **"+ Start"** / **"+ End"** buttons appear in the leg timeline.

### Add cities (legs)
- From the Dashboard, tap **+ City** or use the **+** in the leg timeline.
- Search for a city (uses OpenStreetMap) — it auto-fills the city name, country, and coordinates.
- Set the dates you'll be in that city.
- **Leg Type** — choose from:
  - **Regular** (default) — normal city stop.
  - **Home** — suppresses "add lodging" and "add activities" action items. Shows a 🏠 icon in the timeline.
  - **Staying with Friend** — suppresses "add lodging" action items. You can enter a host address. Shows a 🛋️ icon.
  - **Chill / No Plans** — suppresses "add activities" action items. Shows a 😎 icon.
- Legs are shown as a horizontal timeline: `Home → 🏠 Madrid → Barcelona → 😎 Seville → Home`.

### Reorder or reverse legs
- Open a leg and use the **← →** buttons to swap it with an adjacent leg.
- Use the **⇄** button in the timeline to **reverse all legs** at once — this also reverses all transport directions (e.g., "Madrid → Barcelona" becomes "Barcelona → Madrid") and swaps your start/end locations (including coordinates). You'll get action items to review your transport after reordering.

---

## 2. Plan Your Travel & Lodging Options

### Add transport
- Go to the **Reservations** tab → **+** → **Transport**, or click **+ Transport** on any day card in the itinerary.
- Choose the type (flight, train, bus, car, ferry), set from/to legs, carrier, flight number, departure/arrival times, cost.
- In the itinerary, **travel banners** automatically appear between days when the city changes:
  - If transport exists: shows the carrier, time, and booked status (click to edit).
  - If no transport: shows a dashed **"+ Add Transport"** button that pre-fills the from/to cities and date.

### Add lodging
- Go to **Reservations** → **+** → **Lodging**, or click **+ Lodging** on a day card.
- Fill in the hotel name, leg, check-in/out dates, cost, and booking status.
- Note: Lodging action items are automatically suppressed for **Home** and **Staying with Friend** leg types.

### Research hotel options
Hotel options let you track candidate hotels before committing.

1. Go to **Reservations** → **+** → **Hotel Option**.
2. Add the hotel name, city, booking link, cost per night, and notes (e.g., "has pool", "near metro").
3. Hotel options appear in the **Hotel Options** section on the Reservations tab.
4. In the itinerary, **unbooked nights** show a collapsible "Hotel options for [city]" hint with your saved options and a **Book** button.
5. Clicking **Book** opens a quick-book modal — set check-in/out dates and it creates a real lodging entry marked as booked. The hotel option stays in your list for reuse.

### Smart Paste
Have a booking confirmation email? Use **Smart Paste** in the itinerary view to paste the text. It extracts dates, times, confirmation codes, carriers, and hotel names, then lets you save them as transport, lodging, or activities.

---

## 3. Finalize & Track Your Bookings

### Reservations tab
The Reservations tab groups everything by type:
- **Flights**, **Trains**, **Other Transport** — sorted by departure.
- **Hotels** — sorted by check-in.
- **Hotel Options** — your research list with Book/Edit buttons.
- **Activity Reservations** — activities that need booking.

Each card shows the booked/unbooked badge, confirmation code (click to copy), cost, and dates. Toggle booking status with the checkbox icon.

### Action Items tab
A phased checklist tracks your planning progress:
1. **Plan Cities** — have you added legs?
2. **Book Lodging** — are all lodging entries booked? Shows hotel option count if available. Skipped for Home and Staying with Friend legs.
3. **Book Transport** — are all transport entries booked?
4. **Book Activities** — are reservable activities booked? Skipped for Home and Chill legs.
5. **Prepare** — packing list progress (if enabled).

**Clicking an action item** auto-populates the modal with the relevant leg and dates — e.g., "Add lodging for Madrid" opens the lodging modal with Madrid's leg and start date pre-filled.

After reordering legs, you'll see **"Review transport"** action items for each transport entry that may need updating.

### Booking progress
The Dashboard shows progress bars for lodging, transport, and activity bookings (X/Y booked).

### Budget tracking
Enable **Show Budget** in Settings. The Dashboard breaks down costs by category (lodging, transport, activities) with multi-currency support.

**Budget target:** Set a budget amount in the trip editor. When set, the Dashboard shows:
- A header: "spent / target" (e.g., "$2,340 / $5,000").
- A progress bar: green (under 75%), amber (75–100%), red (over budget).
- Category breakdown below.

When no budget target is set, the Dashboard shows total spent with category breakdown as before.

---

## 4. Plan Your Activities

### Add activities
- Tap **+ Activity** from the Dashboard, itinerary day card, or FAB menu.
- Set the name, category (dining, culture, entertainment, sports, etc.), leg, date, time, duration, cost, and URL.
- Key toggles:
  - **Reservation needed** — tracks booking status.
  - **Available any day in this leg** (pooled) — appears in the "Pool" section, usable on any day.
  - **Must happen on specific date/time** (fixed) — pinned to its date.

### Activity photos
- In the activity editor, use **Upload** to add photos from your device (automatically resized to max 800px wide, JPEG quality 0.7) or **From URL** to add a photo by URL.
- Maximum 5 photos per activity.
- Photos appear as small 48x48 thumbnails in the editor with an X button to remove.
- Enable **Show Photos** in Settings to display photo strips in the itinerary views (ordered and unordered), day plan expanded cards, and map popups.
- Photos are stored in the activity's JSON data — URLs are stored as-is, file uploads as base64 data URLs. Both export with `JSON.stringify`.

### Day plan links
When editing an activity, a banner at the bottom shows which **day plan(s)** it belongs to, with clickable links to jump directly to that day plan's editor.

**Navigation improvement:** When you navigate Activity → Day Plan → click another activity, the second activity opens without a Back button (since you're already where you started). Previously this would incorrectly show a Back button.

### Option groups (alternatives)
Use option groups when you have multiple alternatives and only plan to do one.

1. Create an option group: give it a name like "Lunch spots" or "Museums" and assign it to a leg.
2. When adding activities, assign them to the option group via the **Option Group** dropdown.
3. Activities in the same group show a `[Group Name]` label.
4. **When you visit one**, the others automatically dim — signaling you've made your pick.
5. In the pool, visited alternatives are hidden entirely.

### Day Plans (proposed daily itineraries)

Day plans are reusable "packages" of activities for a city — like having 3 different day-plans ready for a 3-day stay, then picking which one to follow each morning.

**Creating a day plan:**
1. Switch to the **Day Plans** view (third button next to Ordered/Unordered in the itinerary tab).
2. Click **+ New Day Plan**.
3. Give it a name (e.g., "Walking Tour Day", "Beach & Tapas", "Museum Circuit").
4. Assign it to a leg (city).
5. Check the activities you want to include and drag them into the order you'd follow.
6. Click any activity name in the list to **edit it inline** — this opens the activity editor with a **Back** button that returns you to the day plan editor with your changes preserved.
7. Leave **Assigned Date** empty to keep it floating (recommended).

**Expandable day plan cards:**
- In the Day Plans view, each plan card can be **expanded by clicking** its name/body area.
- **Collapsed** (default): shows activity names joined with arrows, notes, and Use/Edit buttons.
- **Expanded**: shows each activity as its own row with category icon, name, time, and duration. **Click any activity row** to open its editor. If **Show Photos** is enabled, photo strips appear below activities that have photos.

**Day Plans view:**
- The **Day Plans** view shows all your plans organized by city, with archived plans in a collapsible section at the bottom.
- Each plan card shows its activity sequence (with arrows), notes, and buttons to **Use on...** a date or **Edit**.
- Filter by leg to focus on one city's plans.
- The FAB (+) button creates a new day plan.

**Browsing day plans in the itinerary:**
- In the ordered itinerary, each day card also shows a collapsible **"Day plans for [city]"** section listing all unused plans for that leg.
- Each plan shows its name, activity sequence (with arrows: "Sagrada Familia → Park Guell → La Boqueria"), and notes.

**Using a day plan:**
1. On the day you want to follow a plan, expand "Day plans for [city]" and click **Use**.
2. This moves all the plan's activities onto that date. They appear as that day's activities with sequence numbers.
3. The plan is **archived** — it disappears from the browsable pool but is preserved under "Archived Day Plans" at the bottom of the itinerary.
4. The day card subtitle shows the plan name (e.g., "Monday · Barcelona · Walking Tour Day").

**Restoring an archived plan:**
- Expand the **Archived Day Plans** section → click **Restore** on any plan to return it to the floating pool.

**Example flow:**
> You're planning 3 days in Barcelona. You create three day plans:
> - "Gaudi Tour" — Sagrada Familia, Park Guell, Casa Batllo
> - "Gothic Quarter" — Cathedral, Picasso Museum, Born neighborhood walk
> - "Beach Day" — Barceloneta, seafood lunch, W Hotel rooftop bar
>
> On your first morning in Barcelona, you open the itinerary, see all three plans listed, and tap **Use** on "Gaudi Tour". Its activities appear on today's card. The next morning, you pick "Gothic Quarter". On day 3, it's raining, so you skip "Beach Day" and improvise — the plan stays in your pool for a future trip.

### Floating Day Plans section
At the bottom of the ordered itinerary, unused floating plans are listed with:
- The plan name and city badge.
- A **"Use on..."** dropdown to apply it to any date.
- An **Edit** button.

---

## 5. Track Activities as You Travel

### Day-by-day itinerary (ordered mode)
The primary view while traveling. Each day card shows:
- Transport events (flights, trains with times and booked status).
- Lodging check-in/out events.
- Activities in order (with sequence numbers if from a day plan).
- Photo strips below activities (when **Show Photos** is enabled).
- Hotel options for unbooked nights.
- Available day plans for the current city.
- Quick-add buttons for activities, lodging, transport, and hotel options.

### Mark activities as visited
- Tap the checkbox next to any activity to mark it **visited**.
- It gets a strikethrough style and moves to the bottom of the day.
- A 5-star **rating** widget appears — rate the experience.
- Option group alternatives automatically dim.

### Skip activities
- On today's date, each unvisited activity has a **skip (✕)** button.
- Skipped activities are dimmed but can be restored with the **↩** button.

### Move activities between days
- **Drag and drop** any activity from one day card to another.
- Drop on an expanded card body or a collapsed card header.
- The activity's date and leg update automatically.

### Unordered mode (by city)
Switch to **Unordered** mode to see all activities grouped by city instead of by date. Activities with dates that fall within a leg's range appear under that city. Each city section has quick-add buttons.

---

## 6. Use the Map

### Map view
Switch to the **Map** tab to see all your places on an OpenStreetMap map.

- **Purple circles** = lodging.
- **Blue/green numbered circles** = activities (blue = unvisited, green = visited). When a day plan is selected, each activity shows its **sequence number** (1, 2, 3...) matching the plan's visit order.
- **Amber city markers** = city/leg markers showing **day numbers** (e.g., "1–5" for a 5-day leg, or "1–3, 8–10" if the city has multiple legs). The city name appears below the marker.
- **Green home markers** = start/end location markers (shown when trip route is on and coordinates are set).

### Map label overlap
When markers are close together, an automatic **collision detection** pass nudges overlapping labels apart so they remain readable. This runs after markers are placed and again on zoom/pan. Markers also have layered z-index values (activities > lodging > cities) so smaller markers render above larger city labels.

### Filter the map
- **By leg** — show only places in one city.
- **By day plan** — show only activities in a specific day plan. This also draws an **OSRM driving route** between the stops with estimated travel times, and activities show sequence numbers.
- **By category** — show only dining, culture, entertainment, etc.

### Trip route
Click the **Route** toggle button in the map filter bar to draw the overall trip route connecting cities in leg order. When start/end locations have coordinates, they are included in the route (start prepended, end appended). The route uses amber styling matching the city markers and includes directional arrows showing travel direction. Green home markers appear for start/end locations. The trip route is shown when no day plan is selected.

### Map popups
Click any marker to see:
- Name, address, time.
- First photo thumbnail (if activity has photos).
- Day numbers for city markers.
- Links to navigate via OpenStreetMap.
- Edit button to open the item's modal.

### Export GPX
Click **Export GPX** to download a GPX file of the currently visible map items. If a day plan is selected, the GPX includes a route. Import into OsmAnd, Maps.me, or any GPS app for offline navigation.

---

## Export & Import

| Format | What it includes | How to use |
|--------|-----------------|------------|
| **JSON (single trip)** | One trip with all data (including photos, coordinates, leg types) | Settings → Export This Trip |
| **JSON (all data)** | All trips + settings | Settings → Export All |
| **ICS (calendar)** | Transport, lodging, activities with times | Settings → Export Calendar |
| **GPX** | Waypoints + day plan routes | Map tab → Export GPX |
| **WhatsApp** | Formatted itinerary text | Settings → Share on WhatsApp |
| **JSON import** | Restore trips from export | Settings → Import |

All new fields (budget, startLocationCoords, endLocationCoords, legType, hostAddress, photos) are included in JSON exports automatically. Sensitive data (confirmation codes, phone numbers) respects your **Sensitive Data Mode** setting when exporting.

---

## Settings

- **Dark Mode** — toggle dark/light theme.
- **Sensitive Data Mode**:
  - *Restricted* — hides confirmation codes, phone numbers, booking platforms.
  - *Unrestricted* — shows everything, stored as plaintext.
  - *Encrypted* — shows everything, stored encrypted with a passphrase.
- **Default Currency** — used for new items.
- **Date/Time Format** — customize display format.
- **Show Budget** — enable budget tracking on Dashboard.
- **Show Travel Times** — show estimated travel times on map routes.
- **Show Packing List** — enable packing checklist in Action Items.
- **Show Photos** — display activity photo strips in itinerary views, expandable day plan cards, and map popups.

---

## Tips

- **Form recovery**: If you accidentally close a tab while filling in a form, the app saves your work. On reload, a purple banner offers to restore your unsaved form.
- **Session persistence**: Refreshing the page keeps you on the same trip and tab.
- **Multi-currency**: Each item can have its own currency. The budget view shows totals per currency.
- **Packing list**: Group items by category (Clothes, Toiletries, Electronics, etc.) and check them off as you pack.
- **Day plans on the map**: Select a day plan in the Map filter to see the walking/driving route between stops with time estimates.
- **Photo storage**: URL photos are stored as plain URLs (lightweight). File uploads are resized and stored as base64 data URLs (~200KB max each). Both types export with your trip data.
