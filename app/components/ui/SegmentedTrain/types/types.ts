import type { RouteStation } from "@/app/types/train.types";

export interface SegmentedTrainProps {
  engineProgress: number;
  backgroundColor?: string;
  isVisible?: boolean;
  journeyDate?: string | null;
  distanceFromOriginKm?: number | null;
  showStatusDot?: boolean;
  currentStationCode?: string | null;
  destinationStationCode?: string;
  currentLocationStatus?: string | null;
  distanceFromLastStationKm?: number | null;
  currentSequence?: number | null;
  route?: RouteStation[];
  lastUpdatedAt?: string | null;
  startObservingTooltip: boolean;
  onTooltipShown: () => void;
}

export interface SegmentPosition {
  x: number;
  y: number;
  rotation: number;
  progress: number;
}

export interface TrainSegmentProps {
  file: string;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
}

export interface SliceConfig {
  dasharray: string;
  dashoffset: number;
  minProgress?: number;
  maxProgress?: number;
}
