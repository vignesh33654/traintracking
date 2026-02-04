import { useMemo } from "react";
import { calculateShadowSlice } from "../utils/slice-calculations";
import type { SegmentPosition, SliceConfig } from "../types/types";

/**
 * Custom hook to calculate shadow slice configuration for train shadow rendering
 * Uses the same calculation as mask but without gap adjustments
 */
export function useShadowSlice(segmentPositions: SegmentPosition[]): SliceConfig | null {
  return useMemo(() => {
    return calculateShadowSlice(segmentPositions);
  }, [segmentPositions]);
}
