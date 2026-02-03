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

export interface VisibleRange {
  startIndex: number;
  endIndex: number;
}

/**
 * Calculate which pills are visible based on scroll progress.
 */
export function calculateVisibleRange(
  scrollProgress: number,
  gapRatio: number,
  scrollRange: number,
  totalItems: number,
  buffer: number = 15
): VisibleRange {
  if (gapRatio === 0 || totalItems === 0) {
    return { startIndex: 0, endIndex: 0 };
  }

  const offset = scrollProgress * scrollRange;
  const minVisible = Math.floor(-offset / gapRatio);
  const maxVisible = Math.ceil((1 - offset) / gapRatio);
  const startIndex = Math.max(0, minVisible - buffer);
  const endIndex = Math.min(totalItems - 1, maxVisible + buffer);

  return { startIndex, endIndex };
}
