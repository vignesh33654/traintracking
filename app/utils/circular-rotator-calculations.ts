import { getPositionOnPath, getPathTotalLength } from "./circular-rotator-utils";
import { calculatePillProgress } from "./train-scroll-calculator";
import { formatTimeAmPm } from "./time-formatters";
import type { RouteStation } from "../types/train.types";
import type { PillPosition, PillData, TimeLabelData, StationLabelData } from "../types/circular-rotator.types";
import {
  MILESTONE_CONFIG,
  TIME_LABEL_PILL_OFFSET,
  STATION_LABEL_PILL_OFFSET,
  TIME_PATH_OFFSET,
  STATION_PATH_OFFSET,
  TRACK_PATH_CONFIG,
} from "../config/circular-rotator.config";
import { PILL_CONFIG } from "../config/circular-rotator.config";

const DAYMARKER_PILL_OFFSET = PILL_CONFIG.pillsBeforeFirstStation + 2;
const BASE_PATH_LENGTH = getPathTotalLength();
const STRAIGHT_LENGTH = TRACK_PATH_CONFIG.arcStartY - TRACK_PATH_CONFIG.railTop;
const BASE_ARC_LENGTH = Math.PI * TRACK_PATH_CONFIG.arcRadius;
const TIME_ARC_LENGTH = Math.PI * (TRACK_PATH_CONFIG.arcRadius - TIME_PATH_OFFSET);
const STATION_ARC_LENGTH = Math.PI * (TRACK_PATH_CONFIG.arcRadius + STATION_PATH_OFFSET);
const TIME_TOTAL_LENGTH = 2 * STRAIGHT_LENGTH + TIME_ARC_LENGTH;
const STATION_TOTAL_LENGTH = 2 * STRAIGHT_LENGTH + STATION_ARC_LENGTH;

function mapBaseDistanceToPathPercent(
  distanceAlongBase: number,
  targetArcLength: number,
  targetTotalLength: number
): number {
  if (distanceAlongBase <= 0) return 0;

  const afterLeftStraight = distanceAlongBase - STRAIGHT_LENGTH;
  if (afterLeftStraight <= 0) {
    return (distanceAlongBase / targetTotalLength) * 100;
  }

  const afterArc = afterLeftStraight - BASE_ARC_LENGTH;
  if (afterArc <= 0) {
    // In the arc: keep the same angle by matching arc progress, not absolute distance
    const arcProgress = afterLeftStraight / BASE_ARC_LENGTH; // 0..1 over the base arc
    const targetDistance = STRAIGHT_LENGTH + targetArcLength * arcProgress;
    return (targetDistance / targetTotalLength) * 100;
  }

  // Right straight: lengths are the same, so add the remainder directly
  const targetDistance = STRAIGHT_LENGTH + targetArcLength + afterArc;
  const percent = (targetDistance / targetTotalLength) * 100;
  return Math.max(0, Math.min(100, percent));
}

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
      const pillIndex = originalIndex * pillsPerStation + TIME_LABEL_PILL_OFFSET;
      const { clampedProgress, isVisible } = calculatePillProgress(
        pillIndex,
        scrollProgress,
        gapRatio,
        scrollRange
      );

      const time = formatTimeAmPm(station.scheduledArrival);
      const distanceAlongBase = clampedProgress * BASE_PATH_LENGTH;

      return {
        id: station.id,
        time,
        startOffsetPercent: mapBaseDistanceToPathPercent(
          distanceAlongBase,
          TIME_ARC_LENGTH,
          TIME_TOTAL_LENGTH
        ),
        isVisible,
      };
    });
}

export function calculateStationLabels(
  stations: RouteStation[],
  scrollProgress: number,
  gapRatio: number,
  scrollRange: number,
  pillsPerStation: number
): StationLabelData[] {
  return stations
    .map((station, originalIndex) => ({ station, originalIndex }))
    .filter(({ station }) => station.sequence > 0)
    .map(({ station, originalIndex }) => {
      const pillIndex = originalIndex * pillsPerStation + STATION_LABEL_PILL_OFFSET;
      const { clampedProgress, isVisible } = calculatePillProgress(
        pillIndex,
        scrollProgress,
        gapRatio,
        scrollRange
      );

      const label = station.stationName.toUpperCase();
      const distanceAlongBase = clampedProgress * BASE_PATH_LENGTH;

      return {
        id: station.id,
        label,
        startOffsetPercent: mapBaseDistanceToPathPercent(
          distanceAlongBase,
          STATION_ARC_LENGTH,
          STATION_TOTAL_LENGTH
        ),
        isVisible,
      };
    });
}

function calculateDistanceKmPillIndices(
  stations: RouteStation[],
  pillsPerStation: number
): Map<number, number> {
  const distanceKmPills = new Map<number, number>();
  if (stations.length === 0) return distanceKmPills;

  const maxDistance = stations[stations.length - 1]?.distanceFromSourceKm || 0;
  let currentMilestone = MILESTONE_CONFIG.intervalKm;

  for (
    let stationIndex = 0;
    stationIndex < stations.length && currentMilestone <= maxDistance;
    stationIndex++
  ) {
    const stationDistance = stations[stationIndex].distanceFromSourceKm;

    while (currentMilestone <= stationDistance) {
      const stationFirstPill = stationIndex * pillsPerStation + PILL_CONFIG.pillsBeforeFirstStation + 1;
      const distancePillIndex = stationFirstPill - MILESTONE_CONFIG.pillOffsetBeforeStation;

      if (distancePillIndex > 0) {
        distanceKmPills.set(distancePillIndex, currentMilestone);
      }
      currentMilestone += MILESTONE_CONFIG.intervalKm;
    }
  }

  return distanceKmPills;
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
      const dayMarkerPillIndex = stationFirstPill + DAYMARKER_PILL_OFFSET;
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
  const distanceKmPills = calculateDistanceKmPillIndices(stations, pillsPerStation);
  const dayMarkerPills = calculateDayMarkerPillIndices(stations, pillsPerStation);

  return Array.from({ length: itemCount - 1 }, (_, i) => {
    const index = i + 1;
    const adjustedIndex = index - pillsBeforeFirstStation;
    const stationIndex = adjustedIndex > 0
      ? Math.floor(adjustedIndex / pillsPerStation)
      : -1;
    const isFirstPill = adjustedIndex > 0 && adjustedIndex % pillsPerStation === 1;
    const station = stationIndex >= 0 ? stations[stationIndex] : undefined;

    const distanceKmValue = distanceKmPills.get(index);
    const dayNumber = dayMarkerPills.get(index);

    return {
      index,
      stationName: station?.stationName || "",
      stationCode: station?.stationCode || "",
      isActualStation: isFirstPill && !!station,
      distanceFromSourceKm: distanceKmValue,
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
