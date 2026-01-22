import { TRACK_VIEWPORT_HEIGHT } from "../config/circular-rotator.config";

export interface ScrollConfig {
  itemCount: number;
  pillGap: number;
  pathTotalLength: number;
}

export interface ScrollParams {
  gapRatio: number;
  scrollRange: number;
  totalScrollHeight: number;
}

export interface PillProgress {
  unclampedProgress: number;
  clampedProgress: number;
  isVisible: boolean;
}

export function calculateScrollParams(config: ScrollConfig): ScrollParams {
  const { itemCount, pillGap, pathTotalLength } = config;

  const gapRatio = pillGap / pathTotalLength;
  const contentLength = (itemCount - 1) * gapRatio;
  const scrollRange = 1 - contentLength;

  const minScrollDistance = itemCount * pillGap;
  const viewportHeight = TRACK_VIEWPORT_HEIGHT;

  const totalScrollHeight = Math.max(
    minScrollDistance,
    Math.abs(scrollRange) * pathTotalLength
  ) + viewportHeight;

  return {
    gapRatio,
    scrollRange,
    totalScrollHeight,
  };
}

export function calculatePillProgress(
  index: number,
  scrollProgress: number,
  gapRatio: number,
  scrollRange: number
): PillProgress {
  const basePosition = index * gapRatio;
  const unclampedProgress = basePosition + scrollProgress * scrollRange;
  const clampedProgress = Math.max(0, Math.min(1, unclampedProgress));
  const isVisible = unclampedProgress >= 0 && unclampedProgress <= 1;

  return {
    unclampedProgress,
    clampedProgress,
    isVisible,
  };
}
