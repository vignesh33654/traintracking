"use client";

import { useMemo } from "react";
import type { RouteStation } from "../types/train.types";
import { formatTimeAmPm } from "../utils/train-formatters";

interface ActiveStationData {
  stationName: string;
  stationCode: string;
  scheduledDeparture?: string;
  platform: string;
  day: number;
}

export function useMobileActiveStation(
  scrollProgress: number,
  stations: RouteStation[],
  pillsPerStation: number,
  gapRatio: number,
  scrollRange: number,
  pillsBeforeFirstStation: number
): ActiveStationData | null {
  return useMemo(() => {
    if (stations.length === 0 || gapRatio === 0) return null;

    // Keep the active station tied to the same checkpoint used by the mobile tooltip.
    const firstStationPillIndex = pillsBeforeFirstStation + 0.5;
    const checkpointPosition = firstStationPillIndex * gapRatio;

    // Find which pill index is currently at the checkpoint position
    // Formula: position = pillIndex * gapRatio + scrollProgress * scrollRange
    // Solving for pillIndex: pillIndex = (position - scrollProgress * scrollRange) / gapRatio
    const currentPillAtCheckpoint = (checkpointPosition - scrollProgress * scrollRange) / gapRatio;

    // Convert pill index to station index
    const adjustedIndex = currentPillAtCheckpoint - pillsBeforeFirstStation;
    const stationIndex = Math.max(0, Math.min(stations.length - 1, Math.floor(adjustedIndex / pillsPerStation)));

    const station = stations[stationIndex];
    if (!station) return null;

    return {
      stationName: station.stationName,
      stationCode: station.stationCode,
      scheduledDeparture: stationIndex < stations.length - 1
        ? formatTimeAmPm(station.scheduledDeparture)
        : undefined,
      platform: station.platform || "",
      day: station.day,
    };
  }, [scrollProgress, stations, pillsPerStation, gapRatio, scrollRange, pillsBeforeFirstStation]);
}
