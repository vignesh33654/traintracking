# Mock Data vs Real API - Setup Guide

Your train tracking app now supports **both mock data and real API** modes. You can easily switch between them!

---

## Current Setup: MOCK DATA MODE ✅

Right now, your app is using **mock data** (no API calls, no credits used).

### What files are being used:

1. **[app/api/train/route.ts](app/api/train/route.ts)** - Smart route that checks `USE_MOCK_DATA` env variable
2. **[app/api/train/mock-train-data.json](app/api/train/mock-train-data.json)** - Sample train data (Howrah Rajdhani)
3. **[app/api/search/trains/mock-search-data.json](app/api/search/trains/mock-search-data.json)** - Sample search results

### To use mock mode:

Create or update `.env.local` in your project root:

```bash
USE_MOCK_DATA=true
```

Then restart your dev server:
```bash
npm run dev
```

Search for train: **12301**

---

## Switching to REAL API MODE 🚀

When you have API credits, follow these steps:

### Step 1: Get your API key
Get your RailRadar API key from: https://railradar.in

### Step 2: Update environment variables

Edit `.env.local` in your project root:

```bash
# Disable mock mode
USE_MOCK_DATA=false

# Add your real API key
RAIL_RADAR_API_KEY=your_actual_api_key_here
```

### Step 3: Restart the server

```bash
npm run dev
```

That's it! The app will now use the real RailRadar API.

---

## Quick Reference

### Environment Variables

| Variable | Mock Mode | Real API Mode |
|----------|-----------|---------------|
| `USE_MOCK_DATA` | `true` | `false` |
| `RAIL_RADAR_API_KEY` | (not needed) | Your actual key |

### How it works

The [app/api/train/route.ts](app/api/train/route.ts) file checks the `USE_MOCK_DATA` environment variable:

- **If `true`**: Returns data from `mock-train-data.json` (no API calls)
- **If `false`**: Makes real API calls to RailRadar API

---

## Customizing Mock Data

Want to test different scenarios? Edit these files:

### 1. Train Data
**File:** [app/api/train/mock-train-data.json](app/api/train/mock-train-data.json)

**Change train position:**
```json
"currentLocation": {
  "distanceFromOriginKm": 280,  // Change this (0-1447)
  "status": "DEPARTED"            // or "ARRIVED", "AT_STATION"
}
```

**Add delay:**
```json
"overallDelayMinutes": 15  // Change from 1 to any value
```

**Move to different station:**
```json
"currentLocation": {
  "stationCode": "CNB",   // Any station code from route
  "sequence": 7            // Matching sequence number
}
```

### 2. Search Results
**File:** [app/api/search/trains/mock-search-data.json](app/api/search/trains/mock-search-data.json)

Add more trains to the array:
```json
{
  "trainNumber": "12345",
  "trainName": "Your Train Name",
  "sourceStationCode": "SRC",
  "destinationStationCode": "DST"
}
```

---

## Troubleshooting

### Still seeing API Error 429?

1. Check `.env.local` has `USE_MOCK_DATA=true`
2. Restart dev server completely (stop and start)
3. Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+F5 on Windows)
4. Check that `mock-train-data.json` exists in `app/api/train/` folder

### Real API not working?

1. Verify `USE_MOCK_DATA=false` in `.env.local`
2. Check your `RAIL_RADAR_API_KEY` is correct
3. Ensure you have API credits remaining
4. Check the API key has proper permissions

### Search not working?

Make sure the search route is also updated. Check if you need to update:
- [app/api/search/trains/route.ts](app/api/search/trains/route.ts)

---

## Files Overview

```
Traintracking/
├── .env.local                              # Environment config (YOU CREATE THIS)
├── app/
│   ├── api/
│   │   ├── train/
│   │   │   ├── route.ts                   # Smart route (mock or real)
│   │   │   └── mock-train-data.json       # Mock train data
│   │   └── search/
│   │       └── trains/
│   │           ├── route.ts               # Search route
│   │           └── mock-search-data.json  # Mock search data
│   └── config/
│       └── api.config.ts                  # API configuration
└── README-MOCK-VS-REAL-API.md            # This file
```

---

## Testing Checklist

### Mock Mode Testing
- [ ] Set `USE_MOCK_DATA=true`
- [ ] Restart dev server
- [ ] Search for train 12301
- [ ] See circular track with 9 stations
- [ ] Train shows at 280km position
- [ ] Station delays display correctly

### Real API Testing (when you have credits)
- [ ] Set `USE_MOCK_DATA=false`
- [ ] Add `RAIL_RADAR_API_KEY`
- [ ] Restart dev server
- [ ] Search for any real train number
- [ ] See live data from RailRadar API
- [ ] Verify real-time updates work

---

## Summary

**Current Status:** Using MOCK DATA (no API calls)

**To switch to Real API:**
1. Create `.env.local` with:
   ```
   USE_MOCK_DATA=false
   RAIL_RADAR_API_KEY=your_key_here
   ```
2. Restart: `npm run dev`

**To switch back to Mock:**
1. Update `.env.local`: `USE_MOCK_DATA=true`
2. Restart: `npm run dev`

No code changes needed - just update environment variables!
