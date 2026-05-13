# Train Tracking App

A Next.js web app to track Indian train positions in real time — shows live station progress, delays, and journey status with smooth animations.


## What it does

- Search any train by number
- See live position on the route (which station it's at, what's next)
- Shows delay, on-time status, and distance
- Dark mode support
- Sound effects (horn, scroll, destination reached)
- Works on mobile and desktop


## How to run

**1. Install dependencies**
```bash
npm install
```

**2. Set up environment variables**

Create a `.env.local` file in the root:
```
RAIL_RADAR_API_KEY=your_api_key_here
NEXT_PUBLIC_RAIL_RADAR_BASE_URL=https://api.railradar.org/api/v1
```

**3. Start the dev server**
```bash
npm run dev
```


## API

The app uses the [RailRadar](https://railradar.in/) API as the data source.

All API routes are Next.js server-side proxies — the API key is never exposed to the browser.
