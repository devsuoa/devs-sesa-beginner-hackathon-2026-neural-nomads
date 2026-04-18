# How StarGaze Works

StarGaze is a React + TypeScript web app (built with Vite + Tailwind + Framer Motion) that helps users plan, understand, and explore the night sky. This document walks through the architecture and what each piece does.

## Tech stack

- **React 18 + TypeScript** — UI layer
- **Vite** — dev server / bundler
- **Tailwind CSS** — styling
- **Framer Motion** — page / component animations
- **astronomy-engine** (NASA/JPL-derived) — accurate moon phases, planet positions, rise/set calculations
- **Open-Meteo API** — live & forecast weather (cloud cover, wind, temperature)
- **wheretheiss.at API** — live ISS position
- **OpenStreetMap Nominatim** — city search / geocoding

## Top-level structure

```
src/
  App.tsx                  # Tab switcher + global location/weather state
  main.tsx                 # React entry
  index.css                # Tailwind + global styles
  components/              # All views and UI pieces
  hooks/                   # Data fetching (weather, ISS, location)
  utils/astronomy.ts       # Wrappers around astronomy-engine + scoring logic
```

`App.tsx` holds the current `view` (`planner | tonight | skymap | explorer`) and the active location. It fetches weather (`useWeather`) and ISS position (`useISS`), then passes them down to whichever view is active.

## The four tabs

### 1. Best Night (`WeekPlanner.tsx`)

Shows a 7-night forecast with a 0–10 score for each night.

**Scoring** (in `utils/astronomy.ts → calculateDayScore`):
- **55 % Weather** — cloud cover from Open-Meteo
- **35 % Moon** — lunar illumination (less moon = darker sky = better score)
- **10 % Dark-sky bonus** — rough distance from urban light sources

Each day is rendered as a `DayCard` with a circular score ring. Clicking a card selects it and reveals the `DetailPanel` on the right, which shows:
- Cloud cover, moon brightness, temperature, wind stats
- A rendered `MoonVisual` (SVG illumination of the moon)
- **Hourly cloud-cover strip** — sunset → sunrise bar chart computed with `Astronomy.SearchRiseSet`. Each bar is one hour; taller = more clouds. Colours: cyan (clear) → violet (partly) → amber (cloudy) → red (overcast).

### 2. Tonight's Sky (`TonightView.tsx`)

Real-time dashboard for right-now viewing. Shows:
- Visible planets (computed via astronomy-engine for the user's lat/lon and current time)
- ISS position & whether it's currently over their horizon
- Current moon phase + illumination
- Notable nearby/upcoming events

Data is refreshed on intervals (ISS every 10 s, planets every 30 s).

### 3. Sky Map (`SkyMapView.tsx`)

Interactive canvas-based planetarium.

**Rendering loop** (`requestAnimationFrame`):
1. Clear canvas; draw star field (cached sprites for performance).
2. For each constellation: compute alt/az from its RA/Dec via `raDecToAltAz`, project to screen with `toScreen` (stereographic-ish polar projection), draw lines + stars + label.
3. Draw visible planets.
4. Apply pan (`panRef`) and zoom (`zoomRef`, eased toward `targetZoomRef`).

**Interaction**:
- Drag to pan (mouse + touch), inertia on release (`velRef`).
- Pinch to zoom, wheel to zoom, +/− buttons.
- Hover over a constellation **label** → tooltip with season & description. Hit-testing uses `canvas.measureText` on the actual rendered label to produce a tight bounding box (avoids giant invisible hit-zones).
- Click a constellation (on the canvas or in the left-hand list) → info panel slides up.
- **Rocket cursor**: the default cursor is hidden; an SVG rocket follows the pointer, rotates toward direction of travel (eased via `atan2`), and has an animated multi-layer flame + side-booster exhaust + fading particle trail. Thrust scale is driven by cursor speed via a CSS `--thrust` custom property.
- **Left-side constellation list**: filtered to only constellations currently above the horizon (`alt > 0`), recomputed every minute.

### 4. Explorer (`SpaceExplorerView.tsx` + `SolarSystemView.tsx`)

Two sub-modes inside the Explorer tab:
- **Solar System** — a stylized top-down view of the solar system with orbits and a user-controllable spaceship.
- **Space Explorer** — a first-person cockpit HUD (velocity gauge, target-lock reticle, radar with sweeping proximity blips, compass strip, crosshair). Pressing/dragging updates speed, roll, pitch refs which feed the HUD readouts.

## Shared pieces

### `utils/astronomy.ts`
Wraps `astronomy-engine` and provides:
- `getMoonPhase(date)` — phase name, illumination %, emoji
- `getVisiblePlanets(date, lat, lon)` — array of `{ name, altitude, azimuth, magnitude, visible }`
- `raDecToAltAz` / `getLST` — coordinate conversion helpers used by the sky map
- `calculateDayScore` — the 0–10 scoring formula used by the planner
- Curated data arrays: meteor showers, deep-sky objects, bright stars

### `hooks/useWeather.ts`
Fetches 7-day forecast + hourly data from Open-Meteo. Returns `{ days, loading, error }`. Each day has `cloudCover`, `temperature`, `windSpeed`, `sunset`, `sunrise`, and an `hourly[]` array.

### `hooks/useISS.ts`
Polls wheretheiss.at every 10 s for current ISS lat/lon; computes whether it's above the user's horizon.

### `hooks/useLocation.ts`
Handles geolocation permission and default fallback (Auckland). Exposes a setter the `CitySearch` uses to override location.

### `components/CitySearch.tsx`
Type-ahead city picker. Built-in curated cities (with dark-sky flagging) plus live Nominatim search.

### `components/Header.tsx`
Fixed top bar with logo, tab switcher (Best Night / Tonight's Sky / Sky Map / Explorer), and the city search.

### `components/StarField.tsx`
Decorative animated background — twinkling stars drawn on a `<canvas>`, used behind hero sections.

### `components/LoadingScreen.tsx`
Initial splash with orbiting loader while first weather fetch resolves.

## Data flow summary

```
useLocation ──► activeLocation {lat, lon, city}
                   │
                   ├──► useWeather(lat, lon) ──► weather.days, weather.loading
                   ├──► useISS(lat, lon) ─────► iss.latitude/longitude/visible
                   │
                   └──► passed into current view as props
                        │
                        ├── WeekPlanner       → scores each day, renders cards + DetailPanel
                        ├── TonightView       → shows live planets, ISS, moon
                        ├── SkyMapView        → canvas planetarium
                        └── SpaceExplorerView → HUD + solar system
```

## Performance notes

- Star sprites on the sky map are pre-rendered to offscreen canvases and cached (`starSprite`), then blitted each frame — far cheaper than per-star gradient paints.
- The constellation hit-test uses the actual text metrics so the hover region matches what you see.
- Expensive astronomy math (planet positions, sunset/sunrise, visible constellations) is throttled — 30 s or 60 s intervals rather than every frame.
- Rocket cursor / trail updates the DOM via refs inside a single `rAF` loop rather than React state, avoiding re-renders on every mouse move.

## Adding a new feature (quick reference)

- **New tab** → add to the `view` union in `App.tsx` + `Header.tsx`, render the component conditionally.
- **New constellation** → append to the `CONSTELLATIONS` array and `CONSTELLATION_INFO` map in `SkyMapView.tsx`.
- **New scoring factor** → edit `calculateDayScore` in `utils/astronomy.ts` (keep weights summing to 100).
- **New external API** → wrap it in a hook under `src/hooks/` so calling components don't deal with fetch/loading state.
