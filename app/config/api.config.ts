import { API_TIMEOUTS } from "./refetch.config";

export const API_CONFIG = {
  baseURL:
    process.env.NEXT_PUBLIC_RAIL_RADAR_BASE_URL ||
    "https://api.railradar.org/api/v1",
  trainNumber: "12618",
  timeout: API_TIMEOUTS.DEFAULT,
} as const;
