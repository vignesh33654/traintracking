# Train Tracking - Calculations Reference Guide

> A simple guide to understand all calculations used in the train tracking app.
> Uses **Rajdhani Express (12951)** Mumbai → Delhi as example throughout.

---

## Example Train Data (Used in All Examples)

```typescript
// Train: 12951 Rajdhani Express
// Route: Mumbai Central → New Delhi
// Total Distance: 1384 km
// Total Stations: 6

const stations = [
  { stationCode: "MMCT", stationName: "Mumbai Central",  distanceFromSourceKm: 0,    scheduledArrival: null },
  { stationCode: "BRC",  stationName: "Vadodara",        distanceFromSourceKm: 392,  scheduledArrival: 1704067200 }, // 10:30 PM
  { stationCode: "RTM",  stationName: "Ratlam",          distanceFromSourceKm: 622,  scheduledArrival: 1704078000 }, // 1:30 AM
  { stationCode: "KOTA", stationName: "Kota",            distanceFromSourceKm: 865,  scheduledArrival: 1704089700 }, // 5:15 AM
  { stationCode: "MTJ",  stationName: "Mathura",         distanceFromSourceKm: 1178, scheduledArrival: 1704100500 }, // 8:15 AM
  { stationCode: "NDLS", stationName: "New Delhi",       distanceFromSourceKm: 1384, scheduledArrival: 1704107700 }, // 10:15 AM
];

const config = {
  pillGap: 28,           // pixels between each pill
  pillsPerStation: 12,   // pills between stations
  pathTotalLength: 1150, // total U-track length in pixels
};
```

---

## File: `train-scroll-calculator.ts`

### 1. `calculateScrollParams`

| | |
|---|---|
| **What it does** | Sets up the scrolling system - how far can user scroll, how big is the content |
| **When used** | Once when the train route loads |

**Example:**
```typescript
// Input
const config = {
  itemCount: 72,           // 6 stations × 12 pills = 72 total pills
  pillGap: 28,             // 28px between each pill
  pathTotalLength: 1150,   // U-track is 1150px long
};

// Calculation
calculateScrollParams(config);

// Output
{
  gapRatio: 0.024,         // 28 ÷ 1150 = each pill takes 2.4% of track
  scrollRange: -0.72,      // content is 72% longer than visible area (negative = scrolls down)
  totalScrollHeight: 2428, // total scrollable height in pixels
}
```

**Simple Explanation:**
- `gapRatio: 0.024` → Each pill occupies 2.4% of the track
- `scrollRange: -0.72` → You need to scroll 72% to see all content
- `totalScrollHeight: 2428` → The virtual scroll area is 2428px tall

---

### 2. `calculatePillProgress`

| | |
|---|---|
| **What it does** | Finds where a specific pill should appear on the track based on scroll position |
| **When used** | Every frame during scrolling, for each pill |

**Example - Vadodara Station (index 12):**
```typescript
// User has scrolled 30% down the page

// Input
calculatePillProgress(
  index: 12,              // Vadodara is at pill index 12 (first station after Mumbai)
  scrollProgress: 0.3,    // user scrolled 30%
  gapRatio: 0.024,        // from calculateScrollParams
  scrollRange: -0.72      // from calculateScrollParams
);

// Output
{
  unclampedProgress: 0.072,  // 12 × 0.024 + (0.3 × -0.72) = 0.288 - 0.216 = 0.072
  clampedProgress: 0.072,    // same (already between 0-1)
  isVisible: true            // yes, it's on the track
}
```

**Where is Vadodara on screen?**
- `progress: 0.072` = 7.2% along the track
- Track goes: Top-Left → Bottom-Curve → Top-Right
- 7.2% = Still on the **left rail**, near the top

**Example - Same station, scrolled more (80%):**
```typescript
calculatePillProgress(12, 0.8, 0.024, -0.72);

// Output
{
  unclampedProgress: -0.288,  // 0.288 - 0.576 = -0.288 (off screen!)
  clampedProgress: 0,         // clamped to 0 (can't be negative)
  isVisible: false            // pill has scrolled past
}
```

---

## File: `circular-rotator-utils.ts`

### 3. `clamp01`

| | |
|---|---|
| **What it does** | Keeps a number between 0 and 1 (no under/overflow) |
| **When used** | To prevent pills from going outside the track |

**Examples:**
```typescript
clamp01(0.5)   → 0.5   // already valid, no change
clamp01(1.3)   → 1     // too high, capped at end
clamp01(-0.2)  → 0     // too low, capped at start
```

---

### 4. `getArcRotationOffsetDeg`

| | |
|---|---|
| **What it does** | Adds extra tilt to pills when they're on the curved bottom part |
| **When used** | Makes pills look natural when going around the U-bend |

**Example:**
```typescript
// Progress values and their positions:
// 0.00 - 0.35 = Left rail (straight, no extra tilt)
// 0.35 - 0.65 = Bottom curve (needs tilt adjustment)
// 0.65 - 1.00 = Right rail (straight, no extra tilt)

getArcRotationOffsetDeg(0.1)  → 0°      // on left rail, no adjustment
getArcRotationOffsetDeg(0.5)  → -8°     // middle of curve, max adjustment
getArcRotationOffsetDeg(0.35) → -4°     // entering curve, partial adjustment
getArcRotationOffsetDeg(0.9)  → 0°      // on right rail, no adjustment
```

**Visual:**
```
    0.0 ──┐         ┌── 1.0
          │ (0°)    │ (0°)
    0.2 ──┤         ├── 0.8
          │         │
    0.35 ─┤         ├── 0.65
          ╰─────────╯
              0.5
           (-8° tilt)
```

---

### 5. `calculateItemCount`

| | |
|---|---|
| **What it does** | Total pills = stations × pills per segment |
| **When used** | To know how many pill elements to create |

**Example:**
```typescript
// Rajdhani has 6 stations, 12 pills between each

calculateItemCount(6, 12);

// Output: 72 pills total
```

---

### 6. `getPositionOnPath`

| | |
|---|---|
| **What it does** | Converts progress (0-1) to exact screen position (x, y) and rotation |
| **When used** | To position every pill on the U-shaped track |

**Examples with Rajdhani stations:**

```typescript
// Mumbai Central (Start) - progress 0.0
getPositionOnPath(0.0);
// Output: { x: 41, y: 10, rotation: 0 }
// Position: Top-left corner

// Vadodara - progress ~0.17
getPositionOnPath(0.17);
// Output: { x: 41, y: 86, rotation: 0 }
// Position: Left rail, moved down

// Ratlam - progress ~0.33
getPositionOnPath(0.33);
// Output: { x: 41, y: 158, rotation: 0 }
// Position: Left rail, near bottom

// Kota - progress 0.5 (middle of curve)
getPositionOnPath(0.5);
// Output: { x: 180, y: 599, rotation: 82 }
// Position: Bottom center of U, tilted 82°

// Mathura - progress ~0.67
getPositionOnPath(0.67);
// Output: { x: 320, y: 368, rotation: 0 }
// Position: Right rail, going up

// New Delhi (End) - progress 1.0
getPositionOnPath(1.0);
// Output: { x: 320, y: 10, rotation: 0 }
// Position: Top-right corner
```

**Visual Map:**
```
  Mumbai (0.0)              Delhi (1.0)
    x:41,y:10                x:320,y:10
        │                        │
        ▼                        ▲
     Vadodara               Mathura
      (0.17)                 (0.67)
        │                        │
        ▼                        │
      Ratlam ────→ Kota ────────┘
      (0.33)     (0.5)
               x:180,y:599
```

---

## File: `circular-rotator-calculations.ts`

### 7. `calculatePillPosition`

| | |
|---|---|
| **What it does** | Complete position for one pill - combines scroll progress with track position |
| **When used** | For each pill, every scroll frame |

**Example - Kota station when scrolled 40%:**
```typescript
calculatePillPosition(
  index: 36,           // Kota is at pill 36 (3rd station × 12)
  scrollProgress: 0.4, // user scrolled 40%
  gapRatio: 0.024,
  scrollRange: -0.72
);

// Step 1: Calculate pill progress
// basePosition = 36 × 0.024 = 0.864
// scrollOffset = 0.4 × -0.72 = -0.288
// progress = 0.864 - 0.288 = 0.576

// Step 2: Get position on track at progress 0.576
// Output:
{
  x: 252,
  y: 542,
  rotation: 45,
  isVisible: true
}
```

---

### 8. `generateTimePathD`

| | |
|---|---|
| **What it does** | Creates SVG path string for the U-shaped time label track |
| **When used** | Once, to draw the track line |

**Example:**
```typescript
generateTimePathD();

// Output (SVG path):
"M 64 0 L 64 555 A 100 100 0 0 0 296 555 L 296 0"

// Meaning:
// M 64 0       → Start at top-left (x:64, y:0)
// L 64 555     → Draw line down to (x:64, y:555)
// A 100 100... → Draw arc (radius 100) to bottom-right
// L 296 0      → Draw line up to top-right (x:296, y:0)
```

---

### 9. `calculateTimeLabels`

| | |
|---|---|
| **What it does** | Positions arrival time labels next to their stations |
| **When used** | To show "10:30 PM", "1:30 AM" etc. along the track |

**Example:**
```typescript
calculateTimeLabels(
  stations,           // Rajdhani route
  scrollProgress: 0.3,
  gapRatio: 0.024,
  scrollRange: -0.72,
  pillsPerStation: 12
);

// Output:
[
  { id: 1, time: "",          offset: 0,    isVisible: true  }, // Mumbai (no arrival)
  { id: 2, time: "10:30 PM",  offset: 6.5,  isVisible: true  }, // Vadodara
  { id: 3, time: "1:30 AM",   offset: 13,   isVisible: true  }, // Ratlam
  { id: 4, time: "5:15 AM",   offset: 19.4, isVisible: true  }, // Kota
  { id: 5, time: "8:15 AM",   offset: 25.9, isVisible: false }, // Mathura (scrolled off)
  { id: 6, time: "10:15 AM",  offset: 32.4, isVisible: false }, // Delhi (scrolled off)
]
```

---

### 10. `calculateMilestonePillIndices`

| | |
|---|---|
| **What it does** | Finds which pills should show distance markers (50km, 100km, 150km...) |
| **When used** | To display kilometer milestones along the route |

**Example:**
```typescript
// Rajdhani route distances:
// Mumbai: 0km, Vadodara: 392km, Ratlam: 622km, Kota: 865km...

calculateMilestonePillIndices(stations, pillsPerStation: 12);

// Output (Map):
{
  10  → 50,    // Pill 10 shows "50 km"
  10  → 100,   // (multiple milestones before Vadodara)
  ...
  22  → 400,   // Pill 22 shows "400 km" (before Ratlam)
  34  → 600,   // Pill 34 shows "600 km"
  ...
}

// Note: Milestones appear 3 pills BEFORE the station they're closest to
```

---

### 11. `generatePillData`

| | |
|---|---|
| **What it does** | Creates data for every pill - station name, code, if it's an actual station |
| **When used** | Once when route loads, to know what each pill represents |

**Example:**
```typescript
generatePillData(72, stations, 12);

// Output (simplified):
[
  { index: 1,  stationName: "Mumbai Central", stationCode: "MMCT", isActualStation: true,  distanceFromSourceKm: undefined },
  { index: 2,  stationName: "",               stationCode: "",     isActualStation: false, distanceFromSourceKm: undefined },
  { index: 3,  stationName: "",               stationCode: "",     isActualStation: false, distanceFromSourceKm: undefined },
  ...
  { index: 10, stationName: "",               stationCode: "",     isActualStation: false, distanceFromSourceKm: 50 },  // 50km marker!
  ...
  { index: 13, stationName: "Vadodara",       stationCode: "BRC",  isActualStation: true,  distanceFromSourceKm: undefined },
  { index: 14, stationName: "",               stationCode: "",     isActualStation: false, distanceFromSourceKm: undefined },
  ...
]
```

---

### 12. `calculateInitialScrollTop`

| | |
|---|---|
| **What it does** | Calculates where to start the scroll so a specific station is visible |
| **When used** | To auto-scroll to the train's current location on load |

**Example - Start view at Kota (station index 3):**
```typescript
calculateInitialScrollTop(
  initialStationIndex: 3,  // Kota
  pillsPerStation: 12,
  gapRatio: 0.024,
  scrollRange: -0.72,
  totalScrollHeight: 2428
);

// Calculation:
// pillIndex = 3 × 12 = 36
// targetProgress = (36 × 0.024) / 0.72 = 1.2
// scrollTop = 1.2 × (2428 - 600) = 2193.6

// Output: 2194 (pixels from top)
```

---

## File: `utils.ts`

### 13. `cn`

| | |
|---|---|
| **What it does** | Smartly combines CSS class names, handling Tailwind conflicts |
| **When used** | Throughout the app for conditional styling |

**Example:**
```typescript
// Combining classes for a station pill
cn(
  "rounded-full p-2",           // base styles
  "bg-blue-500",                // default color
  isCurrentStation && "bg-green-500",  // override if current
  isDelayed && "bg-red-500"     // override if delayed
);

// If isCurrentStation=true, isDelayed=false:
// Output: "rounded-full p-2 bg-green-500"
// (bg-blue-500 is removed because bg-green-500 wins)

// If isCurrentStation=false, isDelayed=true:
// Output: "rounded-full p-2 bg-red-500"
```

---

## Quick Reference Card

| Function | File | One-Line Description |
|----------|------|---------------------|
| `calculateScrollParams` | train-scroll-calculator | Setup scrolling for X pills |
| `calculatePillProgress` | train-scroll-calculator | Where is pill N when scrolled Y%? |
| `clamp01` | circular-rotator-utils | Keep number between 0-1 |
| `getArcRotationOffsetDeg` | circular-rotator-utils | Extra tilt for curved section |
| `calculateItemCount` | circular-rotator-utils | Total pills = stations × gap |
| `getPositionOnPath` | circular-rotator-utils | Progress → (x, y, rotation) |
| `calculatePillPosition` | circular-rotator-calculations | Full position for one pill |
| `generateTimePathD` | circular-rotator-calculations | SVG path for time track |
| `calculateTimeLabels` | circular-rotator-calculations | Position time labels |
| `calculateMilestonePillIndices` | circular-rotator-calculations | Which pills show km markers |
| `generatePillData` | circular-rotator-calculations | Data for all pills |
| `calculateInitialScrollTop` | circular-rotator-calculations | Auto-scroll to station |
| `cn` | utils | Merge CSS classes smartly |

---

## The Big Picture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER SCROLLS                             │
└─────────────────────┬───────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  calculateScrollParams() → gapRatio, scrollRange                │
│  (runs once on load)                                            │
└─────────────────────┬───────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  FOR EACH PILL:                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ calculatePillProgress(index, scroll) → progress (0-1)    │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ getPositionOnPath(progress) → {x, y, rotation}           │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ RENDER PILL AT (x, y) WITH rotation                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

*Last updated: January 2026*
