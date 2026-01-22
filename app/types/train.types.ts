/**
 * TypeScript types for Train Tracking API
 * Based on RailRadar API schema
 */

// Running days information
export interface RunningDays {
  days: string[];
  allDays: boolean;
  isStartingToday: boolean;
}

// Static train information
export interface Train {
  trainNumber: string;
  trainName: string;
  hindiName: string;
  type: string;
  zone: string;
  sourceStationCode: string;
  sourceStationName: string;
  destinationStationCode: string;
  destinationStationName: string;
  runningDaysBitmap: number;
  runningDays: RunningDays;
  returnTrainNumber: string;
  travelTimeMinutes: number;
  totalHalts: number;
  distanceKm: number;
  avgSpeedKmph: number;
  rakeDetails: string;
  otherDetails: string;
  scrapedAt: number;
  createdAt: number;
  updatedAt: number;
}

// Route station information
export interface RouteStation {
  id: number;
  sequence: number;
  stationCode: string;
  stationName: string;
  isHalt: number;
  scheduledArrival: number;
  scheduledDeparture: number;
  haltDurationMinutes: number;
  platform: string;
  day: number;
  distanceFromSourceKm: number;
  speedOnSectionKmph: number;
  trackTypeId: number;
  // Live data fields
  actualArrivalTime: number | null;
  actualDepartureTime: number | null;
  arrivalDelaySeconds: number | null;
  departureDelaySeconds: number | null;
  livePlatform: string | null;
  liveDistanceKm: number | null;
}

// Current location of train
export interface CurrentLocation {
  latitude: number;
  longitude: number;
  stationCode: string;
  sequence: number;
  status: 'ARRIVED' | 'DEPARTED' | 'EN_ROUTE' | 'NOT_STARTED' | 'COMPLETED';
  distanceFromOriginKm: number;
  distanceFromLastStationKm: number;
}

// Live route station data
export interface LiveRouteStation {
  sequence: number;
  stationCode: string;
  scheduledArrival: number;
  scheduledDeparture: number;
  actualArrival: number | null;
  actualDeparture: number | null;
  delayArrivalMinutes: number | null;
  delayDepartureMinutes: number | null;
  platform: string | null;
  distanceFromOriginKm: number;
}

// Exception/error information
export interface ExceptionInfo {
  type: string;
  message: string;
}

// Live train data
export interface LiveTrainData {
  trainNumber: string;
  trainName: string;
  journeyDate: string;
  lastUpdatedAt: string;
  currentLocation: CurrentLocation | null;
  overallDelayMinutes: number;
  dataSource: string;
  route: LiveRouteStation[];
  exceptionInfo: ExceptionInfo | null;
}

// Journey status
export interface JourneyStatus {
  status: 'UNKNOWN' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  journeyDate: string;
  canFetchLiveData: boolean;
  startTime: string;
  endTime: string;
}

// Metadata about the response
export interface TrainMetadata {
  hasLiveData: boolean;
  lastStaticUpdate: string;
  lastLiveUpdate: string | null;
  canRefreshLive: boolean;
  journeyStatus: JourneyStatus;
}

// Complete API response
export interface TrainApiResponse {
  train: Train;
  route: RouteStation[];
  liveData: LiveTrainData | null;
  metadata: TrainMetadata;
}

// API Error response
export interface ApiError {
  message: string;
  status: number;
  code?: string | null;
}
