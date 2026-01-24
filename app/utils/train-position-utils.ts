import type { RouteStation } from "../types/train.types";

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
 * @returns Object with absolutePillIndex and isValid flag
 */
export function calculateTrainPillIndex(
  distanceFromOriginKm: number | null,
  stations: RouteStation[],
  pillsPerStation: number,
  journeyDate?: string | null,
  pillsBeforeFirstStation: number = 0
): TrainPillPosition {
  if (distanceFromOriginKm === null || stations.length < 2) {
    return { absolutePillIndex: 0, isValid: false };
  }

  const lastStation = stations[stations.length - 1];

  // If train completed journey (distance >= last station), show at final station
  if (distanceFromOriginKm >= lastStation.distanceFromSourceKm) {
    const finalPillIndex = (stations.length - 1) * pillsPerStation + pillsBeforeFirstStation;
    return { absolutePillIndex: finalPillIndex, isValid: true };
  }

  // If train is at origin (km = 0) and journey is not today, check if journey passed
  if (distanceFromOriginKm === 0 && journeyDate) {
    const isJourneyPassed = isDateInPast(journeyDate);
    if (isJourneyPassed) {
      // Journey date passed but train shows km=0 -> assume completed
      const finalPillIndex = (stations.length - 1) * pillsPerStation + pillsBeforeFirstStation;
      return { absolutePillIndex: finalPillIndex, isValid: true };
    }
  }

  // Find which section the train is currently in
  let prevStationIndex = 0;
  for (let i = 0; i < stations.length - 1; i++) {
    if (stations[i].distanceFromSourceKm <= distanceFromOriginKm) {
      prevStationIndex = i;
    } else {
      break;
    }
  }

  const prevStation = stations[prevStationIndex];
  const nextStation = stations[prevStationIndex + 1];

  const sectionDistance = nextStation.distanceFromSourceKm - prevStation.distanceFromSourceKm;

  if (sectionDistance <= 0) {
    return { absolutePillIndex: prevStationIndex * pillsPerStation + pillsBeforeFirstStation, isValid: true };
  }

  const distanceIntoSection = distanceFromOriginKm - prevStation.distanceFromSourceKm;
  const progressInSection = Math.max(0, Math.min(1, distanceIntoSection / sectionDistance));

  const pillsInSection = progressInSection * pillsPerStation;
  const absolutePillIndex = (prevStationIndex * pillsPerStation) + pillsInSection + pillsBeforeFirstStation;

  return { absolutePillIndex, isValid: true };
}

/**
 * Checks if a journey date (YYYY-MM-DD) is in the past compared to today.
 */
function isDateInPast(journeyDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const journey = new Date(journeyDate);
  journey.setHours(0, 0, 0, 0);

  return journey < today;
}
