import type { CurrentLocation, RouteStation } from "../types/train.types";
import { AUTO_SCROLL_CONFIG } from "../config/circular-rotator.config";
import { calculateTrainPillIndex } from "./train-position-utils";

/**
 * Calculates scrollTop to position a specific pill at a target percentage from viewport bottom.
 *
 * @param targetPillIndex - The pill index to position (e.g., train's current position)
 * @param targetViewportPercentFromBottom - Where in viewport (0.5 = 50% from bottom = middle)
 * @param gapRatio - Gap ratio from scroll params
 * @param scrollRange - Scroll range from scroll params (negative value)
 * @param totalScrollHeight - Total scrollable height
 * @returns The scrollTop value to achieve this positioning
 */
export function calculateScrollTopForTrainPosition(
  targetPillIndex: number,
  targetViewportPercentFromBottom: number,
  gapRatio: number,
  scrollRange: number,
  totalScrollHeight: number,
): number {
  const viewportHeight = window.innerHeight;
  const scrollableDistance = totalScrollHeight - viewportHeight;

  // Target: pill should appear at (1 - targetViewportPercentFromBottom) of the visible path
  // For 50% from bottom, this means the pill should be at 0.5 progress on the visible track
  const targetPathProgress = 1 - targetViewportPercentFromBottom;

  // From calculatePillProgress:
  // unclampedProgress = basePosition + scrollProgress * scrollRange
  // where basePosition = targetPillIndex * gapRatio
  //
  // Solve for scrollProgress:
  // targetPathProgress = targetPillIndex * gapRatio + scrollProgress * scrollRange
  // scrollProgress = (targetPathProgress - targetPillIndex * gapRatio) / scrollRange
  const basePosition = targetPillIndex * gapRatio;
  const targetScrollProgress =
    (targetPathProgress - basePosition) / scrollRange;

  // Clamp to valid range and convert to scrollTop
  const clampedScrollProgress = Math.max(0, Math.min(1, targetScrollProgress));
  return clampedScrollProgress * scrollableDistance;
}

interface AutoScrollParams {
  distanceFromOriginKm: number | null;
  currentStationSequence: number | null;
  stations: RouteStation[];
  pillsPerStation: number;
  journeyDate: string | null;
  pillsBeforeFirstStation: number;
  currentLocationStatus: CurrentLocation["status"] | null;
  currentStationCode: string | null;
  gapRatio: number;
  scrollRange: number;
  totalScrollHeight: number;
}

export function isTrainRunningStatus(
  status: CurrentLocation["status"] | null,
): boolean {
  return (
    status === "AT_STATION" || status === "ARRIVED" || status === "DEPARTED"
  );
}

export function getInitialStationIndex(
  isTrainRunning: boolean,
  currentStationSequence: number | null,
): number {
  return isTrainRunning && currentStationSequence
    ? currentStationSequence - 1
    : 0;
}

export function getAutoScrollTop({
  distanceFromOriginKm,
  currentStationSequence,
  stations,
  pillsPerStation,
  journeyDate,
  pillsBeforeFirstStation,
  currentLocationStatus,
  currentStationCode,
  gapRatio,
  scrollRange,
  totalScrollHeight,
}: AutoScrollParams): number {
  const hasLivePosition =
    distanceFromOriginKm !== null || currentStationSequence !== null;

  if (!hasLivePosition) return 0;

  // Determine the target pill based on the most reliable live hint we have.
  let targetPillIndex: number | null = null;

  if (distanceFromOriginKm !== null) {
    const { absolutePillIndex, isValid } = calculateTrainPillIndex(
      distanceFromOriginKm,
      stations,
      pillsPerStation,
      journeyDate,
      pillsBeforeFirstStation,
      currentLocationStatus,
      currentStationCode,
      currentStationSequence,
    );

    if (isValid) {
      targetPillIndex = absolutePillIndex;
    }
  }

  // Fallback: when the API sends station sequence but distance is null
  if (targetPillIndex === null && currentStationSequence !== null) {
    const stationIndex = stations.findIndex(
      (station) => station.sequence === currentStationSequence,
    );

    if (stationIndex >= 0) {
      targetPillIndex =
        stationIndex * pillsPerStation + pillsBeforeFirstStation;
    }
  }

  // Final safety: if we still don't have a target, stay at the top
  if (targetPillIndex === null) {
    return 0;
  }

  return calculateScrollTopForTrainPosition(
    targetPillIndex,
    AUTO_SCROLL_CONFIG.targetViewportPercentFromBottom,
    gapRatio,
    scrollRange,
    totalScrollHeight,
  );
}
