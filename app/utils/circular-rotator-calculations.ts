import { getPositionOnPath } from "./circular-rotator-utils";
import { calculatePillProgress } from "./train-scroll-calculator";
import { formatTimeAmPm } from "./train-formatters";
import type { RouteStation } from "../types/train.types";
import type { PillPosition, PillData, TimeLabelData } from "../types/circular-rotator.types";
import { TIME_TRACK_CONFIG, MILESTONE_CONFIG } from "../config/circular-rotator.config";

export function calculatePillPosition(
  index: number,
  scrollProgress: number,
  gapRatio: number,
  scrollRange: number
): PillPosition {
  const pillProgress = calculatePillProgress(index, scrollProgress, gapRatio, scrollRange);
  const position = getPositionOnPath(pillProgress.clampedProgress);

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

      const offset = clampedProgress * TIME_TRACK_CONFIG.betweenStationsPercentage;
      const time = formatTimeAmPm(station.scheduledArrival)


      return {
        id: station.id,
        time,
        offset,
        isVisible,
      };
    });
}

function calculateMilestonePillIndices(
  stations: RouteStation[],
  pillsPerStation: number
): Map<number, number> {
  const milestonePills = new Map<number, number>();
  if (stations.length === 0) return milestonePills;

  const maxDistance = stations[stations.length - 1]?.distanceFromSourceKm || 0;
  let currentMilestone = MILESTONE_CONFIG.intervalKm;

  for (let stationIndex = 0; stationIndex < stations.length && currentMilestone <= maxDistance; stationIndex++) {
    const stationDistance = stations[stationIndex].distanceFromSourceKm;

    while (currentMilestone <= stationDistance) {
      const stationFirstPill = stationIndex * pillsPerStation + 1;
      const distancePillIndex = stationFirstPill - MILESTONE_CONFIG.pillOffsetBeforeStation;

      if (distancePillIndex > 0) {
        milestonePills.set(distancePillIndex, currentMilestone);
      }
      currentMilestone += MILESTONE_CONFIG.intervalKm;
    }
  }

  return milestonePills;
}

export function generatePillData(
  itemCount: number,
  stations: RouteStation[],
  pillsPerStation: number
): PillData[] {
  const milestonePills = calculateMilestonePillIndices(stations, pillsPerStation);

  return Array.from({ length: itemCount - 1 }, (_, i) => {
    const index = i + 1;
    const stationIndex = Math.floor(index / pillsPerStation);
    const isFirstPill = index % pillsPerStation === 1;
    const station = stations[stationIndex];

    const milestoneValue = milestonePills.get(index);

    return {
      index,
      stationName: station?.stationName || "",
      stationCode: station?.stationCode || "",
      isActualStation: isFirstPill && !!station,
      distanceFromSourceKm: milestoneValue,
    };
  });
}

export function calculateInitialScrollTop(
  initialStationIndex: number,
  pillsPerStation: number,
  gapRatio: number,
  scrollRange: number,
  totalScrollHeight: number
): number {
  if (initialStationIndex <= 0) return 0;
  const pillIndex = initialStationIndex * pillsPerStation;
  const targetProgress = (pillIndex * gapRatio) / Math.abs(scrollRange);
  return targetProgress * (totalScrollHeight - window.innerHeight);
}

