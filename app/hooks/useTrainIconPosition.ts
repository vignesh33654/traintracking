"use client";

import { useMemo } from "react";
import { getPositionOnPath, type PathPosition } from "../utils/circular-rotator-utils";
import { calculatePillProgress } from "../utils/train-scroll-calculator";
import { calculateTrainPillIndex } from "../utils/train-position-utils";
import type { RouteStation, CurrentLocation } from "../types/train.types";

export interface TrainIconPosition extends PathPosition {
  counterRotation: number;
  progress: number;
  isVisible: boolean;
}

export interface UseTrainIconPositionParams {
  distanceFromOriginKm: number | null;
  stations: RouteStation[];
  pillsPerStation: number;
  gapRatio: number;
  scrollRange: number;
  scrollProgress: number;
  journeyDate?: string | null;
  pillsBeforeFirstStation?: number;
  currentLocationStatus?: CurrentLocation["status"] | null;
  currentStationCode?: string | null;
  currentStationSequence?: number | null;
}

export function useTrainIconPosition({
  distanceFromOriginKm,
  stations,
  pillsPerStation,
  gapRatio,
  scrollRange,
  scrollProgress,
  journeyDate,
  pillsBeforeFirstStation = 0,
  currentLocationStatus,
  currentStationCode,
  currentStationSequence,
}: UseTrainIconPositionParams): TrainIconPosition {
  return useMemo(() => {
    // Calculate which pill the train is at based on distance (or station if arrived)
    const { absolutePillIndex, isValid } = calculateTrainPillIndex(
      distanceFromOriginKm,
      stations,
      pillsPerStation,
      journeyDate,
      pillsBeforeFirstStation,
      currentLocationStatus,
      currentStationCode,
      currentStationSequence
    );

    if (!isValid) {
      // Fallback: position at start of track (top-left)
      const position = getPositionOnPath(0);
      return { ...position, counterRotation: -position.rotation, progress: 0, isVisible: true };
    }

    // Use the same formula as pills to position the train icon
    // This makes the train icon follow the exact same path as the pill at that index
    const { clampedProgress, isVisible } = calculatePillProgress(
      absolutePillIndex,
      scrollProgress,
      gapRatio,
      scrollRange
    );

    const position = getPositionOnPath(clampedProgress);
    return {
      ...position,
      counterRotation: -position.rotation,
      progress: clampedProgress,
      isVisible,
    };
  }, [distanceFromOriginKm, stations, pillsPerStation, gapRatio, scrollRange, scrollProgress, journeyDate, pillsBeforeFirstStation, currentLocationStatus, currentStationCode, currentStationSequence]);
}
