export const API_CONFIG = {
  baseURL: process.env.RAIL_RADAR_BASE_URL || 'https://api.railradar.in/api/v1',
  trainNumber: '40037',
  timeout: 15000,
} as const;

export const SERVER_API_CONFIG = {
  apiKey: process.env.RAIL_RADAR_API_KEY || '',
} as const;
