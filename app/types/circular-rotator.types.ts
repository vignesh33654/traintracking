import type { RouteStation, CurrentLocation } from "./train.types";

export interface CircularRotatorProps {
  stations: RouteStation[];
  journeyDate: string | null;
  distanceFromOriginKm: number | null;
  currentLocationStatus: CurrentLocation["status"] | null;
  currentStationSequence: number | null;
  pillGap?: number;
  pillsPerStation?: number;
}

export interface TrackItemProps {
  index: number;
  stationName: string;
  stationCode: string;
  isActualStation: boolean;
  distanceFromSourceKm?: number;
  dayNumber?: number;
  scheduledDeparture?: string;
  platform?: string;
  day?: number;
  registerPillRef: (index: number, node: HTMLDivElement | null) => void;
}

export interface TimePathTextProps {
  stations: RouteStation[];
  scrollProgress: number;
  gapRatio: number;
  scrollRange: number;
  pillsPerStation: number;
  timeSpacing?: number;
}

export interface TrackRailsProps {
  stations: RouteStation[];
  scrollProgress: number;
  gapRatio: number;
  scrollRange: number;
  pillsPerStation: number;
}

export interface PillData {
  index: number;
  stationName: string;
  stationCode: string;
  isActualStation: boolean;
  distanceFromSourceKm?: number;
  dayNumber?: number;
  scheduledDeparture?: string;
  platform?: string;
  day?: number;
}

export interface TimeLabelData {
  id: number;
  time: string;
  x: number;
  y: number;
  rotation: number;
  isVisible: boolean;
}

export interface PillPosition {
  x: number;
  y: number;
  rotation: number;
  isVisible: boolean;
}
