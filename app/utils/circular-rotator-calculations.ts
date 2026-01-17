import { getPositionOnPath, TRACK_CONFIG } from "./circular-rotator-utils";
import { calculatePillProgress } from "./train-scroll-calculator";
import { formatTimeAmPm } from "./train-formatters";
import type { RouteStation } from "../types/train.types";
import type { PillPosition, PillData, TimeLabelData } from "../types/circular-rotator.types";
import { TIME_TRACK_CONFIG } from "../config/circular-rotator.config";

export function calculatePillPosition(
  index: number,
  scrollProgress: number,
  gapRatio: number,
  scrollRange: number
): PillPosition {
  const pillProgress = calculatePillProgress(index, scrollProgress, gapRatio, scrollRange);
  const position = getPositionOnPath(1 - pillProgress.clampedProgress, TRACK_CONFIG);

  return {
    x: position.x,
    y: position.y,
    rotation: position.rotation,
    isVisible: pillProgress.isVisible,
  };
}

export function generateTimePathD(): string {
  const { leftRailX, rightRailX, railTop, arcStartY, arcRadius } = TIME_TRACK_CONFIG;
  return `M ${leftRailX} ${railTop} L ${leftRailX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 0 0 ${rightRailX} ${arcStartY} L ${rightRailX} ${railTop}`;
}

export function calculateTimeLabels(
  stations: RouteStation[],
  scrollProgress: number,
  gapRatio: number,
  scrollRange: number,
  pillsPerStation: number
): TimeLabelData[] {
  return stations
    .filter((station) => station.scheduledArrival != null)
    .map((station, stationIndex) => {
      const pillIndex = stationIndex * pillsPerStation;
      const { clampedProgress, isVisible } = calculatePillProgress(
        pillIndex,
        scrollProgress,
        gapRatio,
        scrollRange
      );

      const offset = (1 - clampedProgress) * 100;
      const time = formatTimeAmPm(station.scheduledArrival);

      return {
        id: station.id,
        time,
        offset,
        isVisible,
      };
    });
}

export function generatePillData(
  itemCount: number,
  stations: RouteStation[],
  pillsPerStation: number
): PillData[] {
  return Array.from({ length: itemCount }, (_, index) => {
    const stationIndex = Math.floor(index / pillsPerStation);
    const isFirstPill = index % pillsPerStation === 0;
    const station = stations[stationIndex];

    return {
      index,
      stationName: station?.stationName || "",
      isActualStation: isFirstPill && !!station,
    };
  });
}

