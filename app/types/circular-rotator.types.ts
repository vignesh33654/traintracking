import type { RouteStation } from "./train.types";

export interface CircularRotatorProps {
  trainNumber: string;
  pillGap?: number;
  pillsPerStation?: number;
}

export interface TrackItemProps {
  index: number;
  gapRatio: number;
  scrollRange: number;
  scrollProgress: number;
  stationName: string;
  isActualStation: boolean;
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
  isActualStation: boolean;
}

export interface TimeLabelData {
  id: number;
  time: string;
  offset: number;
  isVisible: boolean;
}

export interface PillPosition {
  x: number;
  y: number;
  rotation: number;
  isVisible: boolean;
}

