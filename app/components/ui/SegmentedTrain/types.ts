export interface SegmentedTrainProps {
  engineProgress: number;
  backgroundColor?: string;
  isVisible?: boolean;
  journeyDate?: string | null;
  distanceFromOriginKm?: number | null;
  showStatusDot?: boolean;
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
