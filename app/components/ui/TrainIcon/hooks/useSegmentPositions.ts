import { useMemo } from "react";
import { getPositionOnPath } from "../../../../utils/circular-rotator-utils";
import { TRAIN_CONFIG } from "../../../../config/train.config";
import { clamp01, PROGRESS_OFFSETS } from "../utils/segment-utils";
import type { SegmentPosition } from "../types/types";

/**
 * Custom hook to calculate positions for all train segments
 * The engine (Part 1) is the anchor point positioned at engineProgress
 * Other segments extend BEHIND the engine (earlier on the path)
 */
export function useSegmentPositions(engineProgress: number): SegmentPosition[] {
  return useMemo<SegmentPosition[]>(() => {
    return TRAIN_CONFIG.segments.map((_, index) => {
      const clampedProgress = clamp01(engineProgress - (PROGRESS_OFFSETS[index] ?? 0));
      const position = getPositionOnPath(clampedProgress);
      return { ...position, progress: clampedProgress };
    });
  }, [engineProgress]);
}
