export const API_CONFIG = {
  baseURL: process.env.RAIL_RADAR_BASE_URL || 'https://api.railradar.org/api/v1',
  trainNumber: '68445',
  timeout: 60000, // 24 hours
} as const;

export const SERVER_API_CONFIG = {
  apiKey: process.env.RAIL_RADAR_API_KEY || '',
} as const;
