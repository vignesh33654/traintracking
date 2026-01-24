"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  detectTrainPhase,
  type TrainPhase,
  type PhaseInfo,
} from "../utils/train-phase-utils";
import { calculateScrollTopForTrainPosition } from "../utils/train-auto-scroll";
import { PHASE_SCROLL_CONFIG } from "../config/circular-rotator.config";

interface TrainPillProgress {
  absolutePillIndex: number;
  clampedProgress: number;
  isVisible: boolean;
}

interface UsePhaseScrollParams {
  trainPillProgress: TrainPillProgress | null;
  totalStations: number;
  pillsPerStation: number;
  pillsBeforeFirstStation: number;
  gapRatio: number;
  scrollRange: number;
  totalScrollHeight: number;
  isTrainRunning: boolean;
}

interface UsePhaseScrollResult {
  currentPhase: TrainPhase;
  phaseInfo: PhaseInfo | null;
}

/**
 * Hook that implements 3-phase scroll behavior:
 *
 * Phase 1: Train icon moves from 0% → 50% (track stays still)
 * Phase 2: Track scrolls continuously to keep train at 50% (until lastStation - 2)
 * Phase 3: Train icon moves from 50% → 100% (track stays still)
 */
export function usePhaseScroll({
  trainPillProgress,
  totalStations,
  pillsPerStation,
  pillsBeforeFirstStation,
  gapRatio,
  scrollRange,
  totalScrollHeight,
  isTrainRunning,
}: UsePhaseScrollParams): UsePhaseScrollResult {
  const previousPhaseRef = useRef<TrainPhase | null>(null);
  const isScrollingRef = useRef(false);
  const lastScrolledPillIndexRef = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect current phase based on train position
  const phaseInfo = trainPillProgress
    ? detectTrainPhase({
        absolutePillIndex: trainPillProgress.absolutePillIndex,
        clampedProgress: trainPillProgress.clampedProgress,
        totalStations,
        pillsPerStation,
        pillsBeforeFirstStation,
      })
    : null;

  const currentPhase = phaseInfo?.phase ?? "PHASE_1";

  // Scroll handler to keep train icon at center (50%)
  const scrollToKeepIconAtCenter = useCallback(
    (pillIndex: number) => {
      if (isScrollingRef.current) return;

      const targetScrollTop = calculateScrollTopForTrainPosition(
        pillIndex,
        PHASE_SCROLL_CONFIG.iconLockPosition,
        gapRatio,
        scrollRange,
        totalScrollHeight
      );

      isScrollingRef.current = true;
      window.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });

      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Reset scroll lock after animation completes
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, PHASE_SCROLL_CONFIG.scrollDebounceMs);
    },
    [gapRatio, scrollRange, totalScrollHeight]
  );

  // Main phase-aware scroll effect
  useEffect(() => {
    if (!trainPillProgress || !isTrainRunning || !phaseInfo) return;

    const { absolutePillIndex } = trainPillProgress;

    // Log phase transitions for debugging
    if (previousPhaseRef.current !== currentPhase) {
      console.log(
        `[Phase Scroll] Transition: ${previousPhaseRef.current} → ${currentPhase}`
      );
      previousPhaseRef.current = currentPhase;
    }

    switch (currentPhase) {
      case "PHASE_1":
        // Do nothing - let train icon move naturally
        // Track stays at initial position
        break;

      case "PHASE_2":
        // Continuously scroll to keep train at 50%
        // Only scroll if train has moved significantly (avoid jitter)
        const shouldScroll =
          lastScrolledPillIndexRef.current === null ||
          Math.abs(absolutePillIndex - lastScrolledPillIndexRef.current) >=
            PHASE_SCROLL_CONFIG.scrollThreshold;

        if (shouldScroll) {
          scrollToKeepIconAtCenter(absolutePillIndex);
          lastScrolledPillIndexRef.current = absolutePillIndex;
        }
        break;

      case "PHASE_3":
        // Do nothing - let train icon move naturally to end
        // Track stays at the position it was when Phase 2 ended
        break;
    }
  }, [
    trainPillProgress,
    currentPhase,
    isTrainRunning,
    phaseInfo,
    scrollToKeepIconAtCenter,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentPhase,
    phaseInfo,
  };
}
