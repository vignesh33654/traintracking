import { TRAIN_CONFIG } from "../../../../config/train.config";
import { PATH_LENGTH } from "./segment-utils";
import type { SegmentPosition, SliceConfig } from "../types/types";

/**
 * Calculates the mask slice configuration for the train
 * This creates a smooth curvature effect by masking the path behind trailing cars
 */
export function calculateMaskSlice(segmentPositions: SegmentPosition[]): SliceConfig | null {
  if (!TRAIN_CONFIG.mask?.enabled || !segmentPositions.length || !PATH_LENGTH) {
    return null;
  }

  const progresses = segmentPositions.map((p) => p.progress);
  const minProgress = Math.min(...progresses);
  const maxProgress = Math.max(...progresses);

  const rawLength = (maxProgress - minProgress) * PATH_LENGTH;
  if (rawLength <= 0) return null;

  const gapsBetween = Math.max(0, segmentPositions.length - 1);
  const gapTotal = (TRAIN_CONFIG.mask.gapPx ?? 0) * gapsBetween;
  const adjustedLength = Math.max(0, rawLength - gapTotal);

  // Spread the removed length evenly to keep slight gaps without losing alignment
  const startDistance = minProgress * PATH_LENGTH + gapTotal / 2;
  const dasharray = `${adjustedLength} ${PATH_LENGTH}`;
  // Negative offset aligns the dash start with the train's trailing slice direction
  const dashoffset = -startDistance;

  return { dasharray, dashoffset, minProgress, maxProgress };
}

/**
 * Calculates the shadow slice configuration for the train
 * Similar to mask calculation but without gap adjustments
 */
export function calculateShadowSlice(segmentPositions: SegmentPosition[]): SliceConfig | null {
  if (!TRAIN_CONFIG.shadow?.enabled || !segmentPositions.length || !PATH_LENGTH) {
    return null;
  }

  const progresses = segmentPositions.map((p) => p.progress);
  const minProgress = Math.min(...progresses);
  const maxProgress = Math.max(...progresses);

  const rawLength = (maxProgress - minProgress) * PATH_LENGTH;
  if (rawLength <= 0) return null;

  const startDistance = minProgress * PATH_LENGTH;
  const dasharray = `${rawLength} ${PATH_LENGTH}`;
  const dashoffset = -startDistance;

  return { dasharray, dashoffset };
}
