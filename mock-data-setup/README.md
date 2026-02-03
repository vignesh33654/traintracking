# Mock Data Setup - Plug and Play

This folder contains everything you need to test your train tracking app locally **without making any API calls**. Perfect for when you've exhausted your API credits!

## Quick Setup (2 Minutes)

### Step 1: Copy the Mock API Routes

```bash
# Copy the train data mock route
cp mock-data-setup/route.ts app/api/train/route.ts.backup
cp mock-data-setup/route.ts app/api/train/route.ts

# Copy the search mock route
cp mock-data-setup/search-route.ts app/api/search/trains/route.ts.backup
cp mock-data-setup/search-route.ts app/api/search/trains/route.ts

# Copy the mock data files to the API directories
cp mock-data-setup/mock-train-data.json app/api/train/mock-train-data.json
cp mock-data-setup/mock-search-data.json app/api/search/trains/mock-search-data.json
```

### Step 2: Start the App

```bash
npm run dev
```

That's it! Your app now uses mock data instead of the real API.

---

## What's Included

### Files:

1. **mock-train-data.json** - Complete train data with 9 stations
   - Train: Howrah Rajdhani Express (12301)
   - Route: Howrah to New Delhi
   - Live position: Currently between Dhanbad and Gaya (280km from origin)
   - Status: Train is running with 1 minute delay

2. **route.ts** - Mock API route for `/api/train`
   - Returns train data instantly
   - No API key required
   - 500ms simulated delay for realistic feel

3. **mock-search-data.json** - Sample search results
   - 5 different Rajdhani trains
   - Searchable by train number, name, or station codes

4. **search-route.ts** - Mock API route for `/api/search/trains`
   - Filters results based on your search query
   - 300ms simulated delay

---

## How to Use

### Test the Circular Visualization

1. Open the app in your browser (http://localhost:3000)
2. Search for train number: **12301**
3. The circular track will show:
   - 9 stations from Howrah to New Delhi
   - Train currently at 280km (between Dhanbad and Gaya)
   - Real-time animation and scrolling
   - Station information and delays

### Customize the Mock Data

Want to test different scenarios? Edit `mock-train-data.json`:

**Change train position:**
```json
"currentLocation": {
  "distanceFromOriginKm": 280,  // Change this (0-1447)
  "status": "DEPARTED"            // or "ARRIVED", "AT_STATION"
}
```

**Add delay:**
```json
"overallDelayMinutes": 15,  // Change from 1 to any value
```

**Move to different station:**
```json
"currentLocation": {
  "stationCode": "CNB",  // Change to any station code
  "sequence": 7           // Update sequence number
}
```

### Add More Stations

To test with more stations, add entries to the `route` array in `mock-train-data.json`. Make sure to:
- Set `isHalt: 1` for stopping stations
- Increment `sequence` numbers
- Update `distanceFromSourceKm` progressively

---

## Restore Real API

When you want to go back to using the real API:

```bash
# Restore the original routes (if you backed them up)
mv app/api/train/route.ts.backup app/api/train/route.ts
mv app/api/search/trains/route.ts.backup app/api/search/trains/route.ts

# Or just delete this folder and the API will work as before
rm -rf mock-data-setup
```

---

## Delete Everything (Clean Up)

When you're done testing and want to remove all mock files:

```bash
# Delete this entire folder
rm -rf mock-data-setup

# If you copied the routes, restore the originals
git checkout app/api/train/route.ts
git checkout app/api/search/trains/route.ts

# Remove copied mock data files
rm app/api/train/mock-train-data.json
rm app/api/search/trains/mock-search-data.json
```

---

## Troubleshooting

### App still showing API Error 429?

Make sure you:
1. Copied the files to the correct locations
2. Restarted the dev server (`npm run dev`)
3. Hard refresh the browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Search not working?

Check that `search-route.ts` was copied to `app/api/search/trains/route.ts` and that `mock-search-data.json` is in the same directory.

### Want different train data?

The mock data is structured exactly like the real API. You can:
- Copy the JSON structure and create multiple train files
- Modify station names, distances, and delays
- Test edge cases like cancelled trains or extreme delays

---

## Technical Details

### Data Structure

The mock data follows the exact `TrainApiResponse` interface:
```typescript
{
  train: Train;              // Static train info
  route: RouteStation[];     // All stations
  liveData: LiveTrainData;   // Current position
  metadata: TrainMetadata;   // Journey status
}
```

### API Endpoints

- `GET /api/train?trainNumber=12301` - Returns full train data
- `GET /api/search/trains?query=raj` - Returns filtered search results

---

## Notes

- Mock data includes realistic delays and live updates
- Train position is set at 280km (between stations 3 and 4)
- All timestamps are in Unix milliseconds
- The visualization will work exactly as with real API data

Enjoy testing without API limits!
