export const API_CONFIG = {
  baseURL:
    process.env.NEXT_PUBLIC_RAIL_RADAR_BASE_URL ||
    "https://api.railradar.org/api/v1",
  trainNumber: "68445",
  timeout: 60000, // 24 hours
  apiKey: process.env.NEXT_PUBLIC_RAIL_RADAR_API_KEY || "",
} as const;
