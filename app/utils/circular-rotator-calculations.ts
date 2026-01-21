import { getPositionOnPath, getPositionOnInnerPath } from "./circular-rotator-utils";
import { calculatePillProgress } from "./train-scroll-calculator";
import { formatTimeAmPm } from "./train-formatters";
import type { RouteStation } from "../types/train.types";
import type { PillPosition, PillData, TimeLabelData } from "../types/circular-rotator.types";
import { MILESTONE_CONFIG } from "../config/circular-rotator.config";

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

export function calculateTimeLabels(
  stations: RouteStation[],
  scrollProgress: number,
  gapRatio: number,
  scrollRange: number,
  pillsPerStation: number
): TimeLabelData[] {
  return stations
    .map((station, originalIndex) => ({ station, originalIndex }))
    .filter(({ station }) => station.sequence > 0 && station.scheduledArrival > 0)
    .map(({ station, originalIndex }) => {
      const pillIndex = originalIndex * pillsPerStation;
      const { clampedProgress, isVisible } = calculatePillProgress(
        pillIndex,
        scrollProgress,
        gapRatio,
        scrollRange
      );

      const position = getPositionOnInnerPath(clampedProgress);
      const time = formatTimeAmPm(station.scheduledArrival);

      return {
        id: station.id,
        time,
        x: position.x,
        y: position.y,
        rotation: position.rotation,
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

  for (
    let stationIndex = 0;
    stationIndex < stations.length && currentMilestone <= maxDistance;
    stationIndex++
  ) {
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

function calculateDayMarkerPillIndices(
  stations: RouteStation[],
  pillsPerStation: number
): Map<number, number> {
  const dayMarkerPills = new Map<number, number>();
  if (stations.length === 0) return dayMarkerPills;

  for (let i = 0; i < stations.length - 1; i++) {
    const currentDay = stations[i].day;
    const nextDay = stations[i + 1].day;

    if (nextDay > currentDay && nextDay >= 2) {
      const stationFirstPill = i * pillsPerStation + 1;
      const dayMarkerPillIndex = stationFirstPill + 2;
      dayMarkerPills.set(dayMarkerPillIndex, nextDay);
    }
  }

  return dayMarkerPills;
}

export function generatePillData(
  itemCount: number,
  stations: RouteStation[],
  pillsPerStation: number,
  pillsBeforeFirstStation: number = 0
): PillData[] {
  const milestonePills = calculateMilestonePillIndices(stations, pillsPerStation);
  const dayMarkerPills = calculateDayMarkerPillIndices(stations, pillsPerStation);

  return Array.from({ length: itemCount - 1 }, (_, i) => {
    const index = i + 1;
    const adjustedIndex = index - pillsBeforeFirstStation;
    const stationIndex = adjustedIndex > 0
      ? Math.floor(adjustedIndex / pillsPerStation)
      : -1;
    const isFirstPill = adjustedIndex > 0 && adjustedIndex % pillsPerStation === 1;
    const station = stationIndex >= 0 ? stations[stationIndex] : undefined;

    const milestoneValue = milestonePills.get(index);
    const dayNumber = dayMarkerPills.get(index);

    return {
      index,
      stationName: station?.stationName || "",
      stationCode: station?.stationCode || "",
      isActualStation: isFirstPill && !!station,
      distanceFromSourceKm: milestoneValue,
      dayNumber,
      scheduledDeparture:
        station && stationIndex < stations.length - 1
          ? formatTimeAmPm(station.scheduledDeparture)
          : undefined,
      platform: station?.platform || undefined,
      day: station?.day,
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
