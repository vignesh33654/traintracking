import { getPathTotalLength } from "../../../utils/circular-rotator-utils";
import { TRAIN_CONFIG } from "../../../config/train.config";

export const PATH_LENGTH = getPathTotalLength();

export const PROGRESS_OFFSETS = (() => {
  if (!PATH_LENGTH) return TRAIN_CONFIG.segments.map(() => 0);

  const offsets: number[] = [];
  let cumulativePx = 0;

  TRAIN_CONFIG.segments.forEach((segment, index) => {
    if (index === 0) {
      offsets.push(0);
      return;
    }

    const prevSegment = TRAIN_CONFIG.segments[index - 1];
    cumulativePx += prevSegment.height / 2 + segment.height / 2 - TRAIN_CONFIG.overlap;
    offsets.push(cumulativePx / PATH_LENGTH);
  });

  return offsets;
})();

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
