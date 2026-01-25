import { PILL_CONFIG } from "../config/circular-rotator.config";

export type TrainPhase = "PHASE_1" | "PHASE_2" | "PHASE_3";

export interface PhaseInfo {
  phase: TrainPhase;
  phase2EndPillIndex: number;
  totalPillCount: number;
}

export interface PhaseDetectionParams {
  absolutePillIndex: number;
  clampedProgress: number;
  totalStations: number;
  pillsPerStation: number;
  pillsBeforeFirstStation: number;
}

/**
 * Determines which phase the train is currently in:
 *
 * Phase 1: Train icon moves from 0% → 50% (track stays still)
 * Phase 2: Track scrolls continuously to keep train at 50% (until lastStation - 2)
 * Phase 3: Train icon moves from 50% → 100% (track stays still)
 *
 * @param params - Phase detection parameters
 * @returns PhaseInfo with current phase and boundary indices
 */
export function detectTrainPhase({
  absolutePillIndex,
  clampedProgress,
  totalStations,
  pillsPerStation,
  pillsBeforeFirstStation,
}: PhaseDetectionParams): PhaseInfo {
  // Calculate total pills on the track
  const totalPillCount =
    (totalStations - 1) * pillsPerStation + pillsBeforeFirstStation;

  // Phase 2 ends at (totalStations - 2), which is station index (totalStations - 3) in 0-indexed
  // For 10 stations: phase2EndStationIndex = 7 (station 8 in 1-indexed)
  const phase2EndStationIndex = Math.max(0, totalStations - 3);
  const phase2EndPillIndex =
    phase2EndStationIndex * pillsPerStation + pillsBeforeFirstStation;

  // Determine current phase
  let phase: TrainPhase;

  // If train hasn't reached 50% of viewport yet
  if (clampedProgress < 0.5) {
    phase = "PHASE_1";
  }
  // If train is at or past 50% but hasn't reached phase2End boundary
  else if (absolutePillIndex < phase2EndPillIndex) {
    phase = "PHASE_2";
  }
  // Train has passed the phase2End boundary
  else {
    phase = "PHASE_3";
  }

  return {
    phase,
    phase2EndPillIndex,
    totalPillCount,
  };
}

/**
 * Calculate the pill index where Phase 2 should end
 * (2 stations before the last station)
 */
export function getPhase2EndPillIndex(
  totalStations: number,
  pillsPerStation: number = PILL_CONFIG.perStation,
  pillsBeforeFirstStation: number = PILL_CONFIG.pillsBeforeFirstStation
): number {
  const phase2EndStationIndex = Math.max(0, totalStations - 3);
  return phase2EndStationIndex * pillsPerStation + pillsBeforeFirstStation;
}
