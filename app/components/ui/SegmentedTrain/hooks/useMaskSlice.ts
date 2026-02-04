import { useMemo } from "react";
import { calculateMaskSlice } from "../utils/slice-calculations";
import type { SegmentPosition, SliceConfig } from "../types/types";

/**
 * Custom hook to calculate mask slice configuration for train path masking
 * This creates a smooth curvature effect by masking the path behind trailing cars
 */
export function useMaskSlice(segmentPositions: SegmentPosition[]): SliceConfig | null {
  return useMemo(() => {
    return calculateMaskSlice(segmentPositions);
  }, [segmentPositions]);
}
