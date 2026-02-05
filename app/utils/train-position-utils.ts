import type { RouteStation, CurrentLocation } from "../types/train.types";

export interface TrainPillPosition {
  absolutePillIndex: number;
  isValid: boolean;
}

/**
 * Calculates the train's position as a pill index based on distance traveled.
 * Handles edge cases: journey not started (km=0), journey completed (km >= last station).
 *
 * @param distanceFromOriginKm - Train's current distance from origin in km (from API)
 * @param stations - Array of stations (filtered to halts only)
 * @param pillsPerStation - Number of pills between each station
 * @param journeyDate - Optional journey date (YYYY-MM-DD) to detect past journeys
 * @param pillsBeforeFirstStation - Offset pills before first station (default: 0)
 * @param currentLocationStatus - Optional current location status (ARRIVED, AT_STATION, etc.)
 * @param currentStationCode - Optional current station code when at a station
 * @returns Object with absolutePillIndex and isValid flag
 */
export function calculateTrainPillIndex(
  distanceFromOriginKm: number | null,
  stations: RouteStation[],
  pillsPerStation: number,
  journeyDate?: string | null,
  pillsBeforeFirstStation: number = 0,
  currentLocationStatus?: CurrentLocation["status"] | null,
  currentStationCode?: string | null,
  currentStationSequence?: number | null,
): TrainPillPosition {
  // DEFENSIVE: If at destination station, lock to final position (prevents resets)
  if (currentStationCode && stations.length > 0) {
    const lastStation = stations[stations.length - 1];
    if (
      currentStationCode === lastStation.stationCode &&
      (currentLocationStatus === "ARRIVED" ||
        currentLocationStatus === "AT_STATION")
    ) {
      const finalPillIndex =
        (stations.length - 1) * pillsPerStation + pillsBeforeFirstStation;
      return { absolutePillIndex: finalPillIndex, isValid: true };
    }
  }

  // If train has arrived at a station, snap to that station's position
  if (
    (currentLocationStatus === "ARRIVED" ||
      currentLocationStatus === "AT_STATION") &&
    currentStationCode
  ) {
    const stationIndex = stations.findIndex(
      (s) => s.stationCode === currentStationCode,
    );
    if (stationIndex !== -1) {
      const absolutePillIndex =
        stationIndex * pillsPerStation + pillsBeforeFirstStation;
      return { absolutePillIndex, isValid: true };
    }
  }

  if (distanceFromOriginKm === null || stations.length < 2) {
    // Fallback to station sequence when distance is unavailable
    if (
      currentStationSequence !== null &&
      currentStationSequence !== undefined
    ) {
      const stationIndex = stations.findIndex(
        (s) => s.sequence === currentStationSequence,
      );
      if (stationIndex !== -1) {
        const absolutePillIndex =
          stationIndex * pillsPerStation + pillsBeforeFirstStation;
        return { absolutePillIndex, isValid: true };
      }
    }

    return { absolutePillIndex: 0, isValid: false };
  }

  const lastStation = stations[stations.length - 1];

  // Safety check: ensure lastStation has valid distance
  if (
    lastStation.distanceFromSourceKm === undefined ||
    lastStation.distanceFromSourceKm === null
  ) {
    return { absolutePillIndex: 0, isValid: false };
  }

  // If train completed journey (distance >= last station), show at final station
  if (distanceFromOriginKm >= lastStation.distanceFromSourceKm) {
    const finalPillIndex =
      (stations.length - 1) * pillsPerStation + pillsBeforeFirstStation;
    return { absolutePillIndex: finalPillIndex, isValid: true };
  }

  // If train is at origin (km = 0) and journey date is in past, assume completed
  if (distanceFromOriginKm === 0 && journeyDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const journey = new Date(journeyDate);
    journey.setHours(0, 0, 0, 0);

    if (journey < today) {
      const finalPillIndex =
        (stations.length - 1) * pillsPerStation + pillsBeforeFirstStation;
      return { absolutePillIndex: finalPillIndex, isValid: true };
    }
  }

  // Find which section the train is currently in
  let prevStationIndex = 0;
  for (let i = 0; i < stations.length - 1; i++) {
    const stationDist = stations[i].distanceFromSourceKm;
    if (
      typeof stationDist === "number" &&
      stationDist <= distanceFromOriginKm
    ) {
      prevStationIndex = i;
    } else {
      break;
    }
  }

  const prevStation = stations[prevStationIndex];
  const nextStation = stations[prevStationIndex + 1];

  // Safety check: ensure both stations have valid distances
  if (
    !nextStation ||
    typeof prevStation.distanceFromSourceKm !== "number" ||
    typeof nextStation.distanceFromSourceKm !== "number"
  ) {
    const fallbackIndex =
      prevStationIndex * pillsPerStation + pillsBeforeFirstStation;
    return { absolutePillIndex: fallbackIndex, isValid: true };
  }

  const sectionDistance =
    nextStation.distanceFromSourceKm - prevStation.distanceFromSourceKm;

  if (sectionDistance <= 0) {
    return {
      absolutePillIndex:
        prevStationIndex * pillsPerStation + pillsBeforeFirstStation,
      isValid: true,
    };
  }

  const distanceIntoSection =
    distanceFromOriginKm - prevStation.distanceFromSourceKm;
  const progressInSection = Math.max(
    0,
    Math.min(1, distanceIntoSection / sectionDistance),
  );

  const pillsInSection = progressInSection * pillsPerStation;
  const absolutePillIndex =
    prevStationIndex * pillsPerStation +
    pillsInSection +
    pillsBeforeFirstStation;

  return { absolutePillIndex, isValid: true };
}
