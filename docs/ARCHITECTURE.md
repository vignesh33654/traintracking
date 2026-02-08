# Train Tracking - Architecture & Data Flow

---

## 1. ARCHITECTURE OVERVIEW

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                     app/page.tsx                        │
│                  (Next.js Entry Point)                  │
└──────────────────────────┬──────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐  ┌──────▼───────────┐     │
│  SearchTrain   │  │      Home        │     │
│  Component     │  │    Component     │     │
│ • Client-side  │  │ • useTrainData   │     │
│   filtering    │  │ • Routes:        │     │
│ • <10ms search │  │   Loading/Error  │     │
│ • 8000+ trains │  │ • Filter halts   │     │
└────────────────┘  └──────┬───────────┘     │
                           │                  │
                           │                  │
┌──────────────────────────▼──────────────────▼───────────┐
│         app/components/ui/CircularRotator/               │
│           CircularRotator.tsx (Orchestrator)            │
│  • useScrollManager (unified scroll state)              │
│  • useTrainIconPosition (train visuals)                 │
│  • useScrollSound (audio feedback)                      │
│  • usePillPositions (animation management)              │
└──────────────────────────┬──────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌─────▼──────┐     ┌────▼────┐
   │TrackRails│      │TrackContainer│   │TrainIcon│
   │(Path SVG)│      │(Pill Render) │   │(Motion) │
   └──────────┘      └──────────────┘    └─────────┘
```

### Key Component Responsibilities

| Component            | Purpose                                                     |
| -------------------- | ----------------------------------------------------------- |
| **Home**             | Data fetching, state routing (loading/error/data)           |
| **SearchTrain**      | Train search UI with instant client-side filtering          |
| **CircularRotator**  | Hook coordinator, scroll orchestrator                       |
| **TrackContainer**   | Generates pill data, renders track elements                 |
| **TrackItem**        | Individual pill/station marker with positioning             |
| **TrainIcon**        | Animated train position indicator                           |
| **TrainProgress**    | Circular progress indicator showing journey completion      |
| **TrainStatus**      | Status display with progress indicator and current location |
| **FooterDottedCard** | Dot matrix display card showing train details               |

---

## 2. DATA FLOW: API → UI

### Data Layer

**API Configuration** (`app/config/api.config.ts`):

- Base URL: `https://api.railradar.org/api/v1`
- Train: `40645` (configurable)
- Timeout: 60 seconds

**Train Details Fetch Chain**:

```
Home Component
    ↓
useTrainData Hook (React Query)
    ↓
fetchTrainData() (app/api/train.api.ts)
    ↓
Next.js API Route (/api/train)
    ↓
apiClient (generic fetch wrapper)
    ↓
RailRadar API v1 (/trains/{trainNumber})
```

**Train Search**: Client-side filtering with one-time fetch of all trains from RailRadar v2 API (`/trains/all-trains`)

### Data Structure

```typescript
API Response {
  train: Train                      // Static info
  route: RouteStation[]            // Schedule + stations
  liveData: {
    journeyDate: string            // "2025-01-24"
    currentLocation: {
      distanceFromOriginKm: number  // e.g., 450
      status: "RUNNING" | "AT_STATION" | ...
      sequence: number              // Current station index
    }
    route: LiveRouteStation[]       // Live station data
  }
  metadata: TrainMetadata          // Timestamps, status
}
```

### Processing Pipeline

```
1. Home receives API data
2. Filter stations (isHalt > 0) → only actual stops
3. Extract core values:
   - distanceFromOriginKm (train's current position)
   - journeyDate (for date-relative calculations)
   - currentLocationStatus (running? at station?)
   - currentStationSequence (which station?)
4. Pass to CircularRotator
```

### Real-Time Updates

- **Initial Load**: React Query fetches on component mount
- **Auto-Refetch**: Every 60 seconds (DEFAULT_REFETCH_INTERVAL)
- **Placeholder Data**: Shows previous data during refetch
- **Manual Refresh**: Refresh button triggers immediate fetch
- **Search**: One-time fetch (~500ms), then instant client-side filtering (<10ms)

---

## 3. STATE MANAGEMENT (Unified Hook Pattern)

### useScrollManager (Single Source of Truth)

**Purpose**: Consolidates all scroll-related state (replaced 5 separate hooks)

**Managed State**:

- Scroll progress (0-1)
- Scroll parameters (gapRatio, scrollRange, totalScrollHeight)
- Train pill progress (distance → pill index)
- Current phase (PHASE_1, PHASE_2, PHASE_3)
- Auto-scroll position

**Sub-Hooks Composed**:

| Hook                   | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `useNativeScroll`      | Window scroll position → 0-1 progress        |
| `useTrainScroll`       | Calculates scroll metrics from station count |
| `useTrainIconPosition` | Distance (km) → visual coordinates           |
| `usePillPositions`     | Updates CSS transforms for all pills         |
| `useScrollSound`       | Audio feedback on pill trigger               |

### Data Flow Through Hooks

```
Window Scroll Event
    ↓
useNativeScroll → scrollProgress (0-1)
    ↓
useScrollManager → Computes pill positions for all pills
    ↓
usePillPositions → Updates CSS custom properties
    ↓
Browsers → Renders visual changes (GPU-accelerated)
```

---

## 4. CORE CALCULATIONS

### A. Scroll System

**Purpose**: Map user scroll position to pill positions

#### `calculateScrollParams(itemCount, pillGap, pathTotalLength)`

- **Input**: Number of pills, gap between pills (px), track length (px)
- **Output**: `{ gapRatio, scrollRange, totalScrollHeight }`
- **Example**: 72 pills × 28px gap = `scrollRange: -0.72` (72% scroll needed)

#### `calculatePillProgress(index, scrollProgress, gapRatio, scrollRange)`

- **Input**: Pill index, scroll 0-1, gap ratio, scroll range
- **Output**: `{ unclampedProgress, clampedProgress, isVisible }`
- **Example**: Pill at index 12, scrolled 30% → progress 0.072 (7.2% on track)

---

### B. Train Positioning

**Purpose**: Convert train's distance (km) to visual position on track

#### `calculateTrainPillIndex(distanceFromOriginKm, stations, pillsPerStation, journeyDate, pillsBeforeFirstStation)`

- **Input**: Current distance, station list, pills per segment, journey date, starting offset
- **Output**: `{ absolutePillIndex, clampedProgress, isVisible }`
- **Logic**:
  - Find which segment (between 2 stations) the train is in
  - Interpolate position within segment
  - Return pill index
- **Handles**: Future journeys, completed journeys, edge cases

#### `calculatePillPosition(index, scrollProgress, gapRatio, scrollRange)`

- **Input**: Pill index, scroll progress, gap ratio, scroll range
- **Output**: `{ x, y, rotation, isVisible }`
- **Process**:
  1. Calculate pill progress on track
  2. Map progress 0-1 to path coordinates
  3. Get (x, y, rotation) from path

---

### C. Path Geometry

**Purpose**: Convert 0-1 progress to exact screen coordinates on U-shaped track

#### `getPositionOnPath(progress)`

- **Input**: Progress value (0 = start, 1 = end)
- **Output**: `{ x, y, rotation }`
- **Track Layout**:
  - 0.00-0.35: Left rail (straight, vertical)
  - 0.35-0.65: Bottom arc (curved)
  - 0.65-1.00: Right rail (straight, vertical)

**Examples**:

```
Progress 0.0  → x: 41,  y: 10   (Top-left)
Progress 0.5  → x: 180, y: 599  (Bottom center, rotated 82°)
Progress 1.0  → x: 320, y: 10   (Top-right)
```

**Configuration** (`app/config/circular-rotator.config.ts`):

```typescript
TRACK_PATH_CONFIG = {
  leftRailX: 41, // Left track x-position
  rightRailX: 320, // Right track x-position
  railTop: 10, // Top y-position
  arcStartY: 460, // Arc start y-position
  arcRadius: 139, // Arc radius
  arcCenterX: 180, // Arc center x
  arcCenterY: 460, // Arc center y
};
```

---

### D. Phase Detection

**Purpose**: 3-phase scrolling system for smooth UX

#### `detectTrainPhase({ absolutePillIndex, totalStations, ... })`

- **Output**: `"PHASE_1" | "PHASE_2" | "PHASE_3"`

**Phases**:

1. **PHASE_1** (0% → 50%): Train icon moves, track stationary
2. **PHASE_2** (50% → 85%): Track auto-scrolls, train stays at 50%
3. **PHASE_3** (85% → 100%): Train icon moves to end, track stationary

**Configuration** (`PHASE_SCROLL_CONFIG`):

```typescript
iconLockPosition: 0.5; // Keep train at 50% in Phase 2
phase2EndStationsFromLast: 2; // Phase 2 ends at station N-2
scrollThreshold: 0.5; // Min movement to trigger scroll
scrollDebounceMs: 300; // Debounce time
```

---

### E. Auto-Scroll

**Purpose**: Position train at center of viewport on initial load and refresh

#### `calculateScrollTopForTrainPosition(targetPillIndex, targetViewportPercent, ...)`

- **Input**: Target pill index, viewport percentage (0.5 = 50%), scroll params
- **Output**: Scroll position in pixels
- **Used For**: Refresh button, initial load positioning

#### `getAutoScrollTop({ distanceFromOriginKm, currentStationSequence, ... })`

- **Input**: Current distance, station sequence, scroll configuration
- **Output**: Scroll position to apply
- **Logic**:
  - Primary: Uses `distanceFromOriginKm` to calculate target pill index
  - Fallback: Uses `currentStationSequence` when distance is null
  - Returns 0 if no live position data available

---

## 5. UTILITY FUNCTIONS REFERENCE

| Function                             | File                          | Purpose                                                      |
| ------------------------------------ | ----------------------------- | ------------------------------------------------------------ |
| `calculateScrollParams`              | train-scroll-calculator       | Compute scroll metrics from pill count                       |
| `calculatePillProgress`              | train-scroll-calculator       | Map scroll position to pill progress                         |
| `calculateTrainPillIndex`            | train-position-utils          | Distance (km) → pill index                                   |
| `calculatePillPosition`              | circular-rotator-calculations | Pill index + scroll → (x, y, rotation)                       |
| `generatePillData`                   | circular-rotator-calculations | Create data array for all pills                              |
| `generateTimePathD`                  | circular-rotator-calculations | Generate SVG path for track                                  |
| `calculateTimeLabels`                | circular-rotator-calculations | Position arrival time labels                                 |
| `calculateMilestonePillIndices`      | circular-rotator-calculations | Find pills for distance markers                              |
| `calculateInitialScrollTop`          | circular-rotator-calculations | Initial scroll position on load                              |
| `getPositionOnPath`                  | circular-rotator-utils        | Progress 0-1 → (x, y, rotation)                              |
| `getArcRotationOffsetDeg`            | circular-rotator-utils        | Extra tilt for curved section                                |
| `clamp01`                            | circular-rotator-utils        | Keep value between 0-1                                       |
| `detectTrainPhase`                   | train-phase-utils             | Determine current phase (1, 2, or 3)                         |
| `calculateScrollTopForTrainPosition` | train-auto-scroll             | Position pill at viewport location                           |
| `getAutoScrollTop`                   | train-auto-scroll             | Distance/sequence → scroll position for auto-scroll          |
| `isTrainRunningStatus`               | train-auto-scroll             | Check if train status is running (AT_STATION/ARRIVED/DEPARTED)|
| `getInitialStationIndex`             | train-auto-scroll             | Get starting station index based on running state            |
| `getProgressState`                   | train-progress-utils          | Determine journey state (not-started, in-progress, complete) |
| `calculatePercentage`                | train-progress-utils          | Calculate journey completion percentage (0-100%)             |
| `generateProgressArcPath`            | train-progress-utils          | Generate SVG path for circular progress arc                  |
| `formatRelativeTime`                 | time-formatters               | Timestamp → relative time ("2h 15m AGO")                     |
| `formatDelay`                        | time-formatters               | Delay minutes → readable string                              |
| `formatTime`                         | time-formatters               | Minutes since midnight → HH:MM                               |
| `formatTimeAmPm`                     | time-formatters               | Minutes since midnight → 12hr AM/PM                          |
| `getTodayDate`                       | todaydate                     | Returns today's date as YYYY-MM-DD                           |
| `isToday`                            | todaydate                     | Check if date string is today                                |

---

## 6. CONFIGURATION FILES

**Location**: `app/config/circular-rotator.config.ts`

| Config                | Values                       | Purpose                     |
| --------------------- | ---------------------------- | --------------------------- |
| `TRACK_PATH_CONFIG`   | Rail positions, arc geometry | Physical track dimensions   |
| `PILL_CONFIG`         | gap: 28, perStation: 12      | Pill spacing and density    |
| `MILESTONE_CONFIG`    | intervalKm: 150              | Distance marker placement   |
| `AUTO_SCROLL_CONFIG`  | targetViewportPercent: 0.5   | Train positioning on scroll |
| `PHASE_SCROLL_CONFIG` | Phase thresholds, debounce   | 3-phase scrolling behavior  |
| `TOOLTIP_OFFSETS`     | left/right offsets           | Tooltip positioning         |
| `MS_PER_MINUTE`       | 60000                        | Milliseconds in one minute  |
| `MINUTES_PER_HOUR`    | 60                           | Minutes in one hour         |
| `HOURS_PER_DAY`       | 24                           | Hours in one day            |

---

## 7. KEY PATTERNS

### Compound Components

- CircularRotator orchestrates TrackContainer, TrackItem, TrainIcon
- Hooks handle communication instead of prop drilling

### Derived State

- All values calculated from scroll + data
- No separate state for positions (prevents sync issues)
- Scroll position is single source of truth

### Performance Optimizations

- `useMemo` for expensive calculations
- `useCallback` for stable references
- CSS custom properties for GPU-accelerated transforms
- `requestAnimationFrame` for animation frame syncing
- Pill memoization prevents unnecessary re-renders

### Configuration-Driven

- All magic numbers in config
- Easy parameter tuning
- Centralized constants

---

## 8. SEARCH FUNCTIONALITY

**Strategy**: Client-side filtering with server-side caching

**Key Points**:

- Fetches all ~8000 trains once from RailRadar v2 API (`/api/search/all`)
- Cached forever on client, 1 hour on server
- Search performance: <10ms (filters on train number, name, source, destination)
- Max 50 results per query

**Data Format**: `[trainNumber, trainName, sourceStationCode, destinationStationCode]`

---

## 9. QUICK LOOKUP

**Need to understand something?**

- **How scroll works?** → See Section 4.A (Scroll System)
- **Where does the train appear?** → See Section 4.B (Train Positioning)
- **Why 3 phases?** → See Section 4.D (Phase Detection)
- **How are pills positioned?** → See Section 4.C (Path Geometry)
- **Where is data coming from?** → See Section 2 (Data Flow)
- **How do hooks work together?** → See Section 3 (State Management)
- **How does search work?** → See Section 8 (Search Functionality)

---

_Last updated: February 2026_
