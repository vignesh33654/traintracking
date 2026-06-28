"use client";

import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { useNativeScroll } from "./useNativeScroll";
import { useTrainScroll } from "./useTrainScroll";
import {
  getAutoScrollTop,
  getInitialStationIndex,
  isTrainRunningStatus,
  calculateScrollTopForTrainPosition,
} from "../utils/train-auto-scroll";
import {
  cancelSmoothWindowScroll,
  smoothWindowScrollTo,
} from "../utils/smooth-window-scroll";
import { calculateInitialScrollTop } from "../utils/circular-rotator-calculations";
import { calculateTrainPillIndex } from "../utils/train-position-utils";
import { calculatePillProgress } from "../utils/train-scroll-calculator";
import {
  detectTrainPhase,
  type TrainPhase,
  type PhaseInfo,
} from "../utils/train-phase-utils";
import { PHASE_SCROLL_CONFIG } from "../config/circular-rotator.config";
import type { RouteStation, CurrentLocation } from "../types/train.types";

interface TrainPillProgress {
  absolutePillIndex: number;
  clampedProgress: number;
  isVisible: boolean;
}

interface UseScrollManagerParams {
  scrollRef: RefObject<HTMLDivElement | null>;
  stations: RouteStation[];
  distanceFromOriginKm: number | null;
  currentLocationStatus: CurrentLocation["status"] | null;
  currentStationSequence: number | null;
  currentStationCode: string | null;
  journeyDate: string | null;
  pillGap: number;
  pillsPerStation: number;
  pillsBeforeFirstStation: number;
}

interface ScrollManagerResult {
  scrollProgress: number;
  gapRatio: number;
  scrollRange: number;
  totalScrollHeight: number;
  trainPillProgress: TrainPillProgress | null;
  performAutoScroll: () => void;
  isTrainRunning: boolean;
  currentPhase: TrainPhase;
  phaseInfo: PhaseInfo | null;
}

/**
 * Unified scroll management hook that handles:
 * - Scroll progress tracking
 * - Scroll metrics calculation
 * - Initial positioning
 * - Auto-scroll functionality
 * - Phase-based scrolling (3-phase system)
 * - Train pill progress calculation
 */
export function useScrollManager({
  scrollRef,
  stations,
  distanceFromOriginKm,
  currentLocationStatus,
  currentStationSequence,
  currentStationCode,
  journeyDate,
  pillGap,
  pillsPerStation,
  pillsBeforeFirstStation,
}: UseScrollManagerParams): ScrollManagerResult {
  // ============================================
  // 1. SCROLL PROGRESS TRACKING
  // ============================================
  const scrollProgress = useNativeScroll(scrollRef);

  // ============================================
  // 2. TRAIN SCROLL METRICS CALCULATION
  // ============================================
  const { gapRatio, scrollRange, totalScrollHeight } = useTrainScroll(
    stations.length,
    pillGap,
    pillsPerStation,
  );

  // ============================================
  // 3. TRAIN RUNNING STATUS
  // ============================================
  const isTrainRunning = useMemo(
    () => isTrainRunningStatus(currentLocationStatus),
    [currentLocationStatus],
  );

  const initialStationIndex = useMemo(
    () => getInitialStationIndex(isTrainRunning, currentStationSequence),
    [isTrainRunning, currentStationSequence],
  );

  // ============================================
  // 4. TRAIN PILL PROGRESS CALCULATION
  // ============================================
  const trainPillProgress = useMemo<TrainPillProgress | null>(() => {
    if (distanceFromOriginKm === null || stations.length === 0) return null;

    const { absolutePillIndex, isValid } = calculateTrainPillIndex(
      distanceFromOriginKm,
      stations,
      pillsPerStation,
      journeyDate,
      pillsBeforeFirstStation,
      currentLocationStatus,
      currentStationCode,
      currentStationSequence,
    );

    if (!isValid) return null;

    return {
      absolutePillIndex,
      ...calculatePillProgress(
        absolutePillIndex,
        scrollProgress,
        gapRatio,
        scrollRange,
      ),
    };
  }, [
    distanceFromOriginKm,
    stations,
    pillsPerStation,
    journeyDate,
    pillsBeforeFirstStation,
    currentLocationStatus,
    currentStationCode,
    currentStationSequence,
    scrollProgress,
    gapRatio,
    scrollRange,
  ]);

  // ============================================
  // 5. PHASE DETECTION
  // ============================================
  const phaseInfo = trainPillProgress
    ? detectTrainPhase({
        absolutePillIndex: trainPillProgress.absolutePillIndex,
        clampedProgress: trainPillProgress.clampedProgress,
        totalStations: stations.length,
        pillsPerStation,
        pillsBeforeFirstStation,
      })
    : null;

  const currentPhase = phaseInfo?.phase ?? "PHASE_1";

  // ============================================
  // 6. INITIAL SCROLL POSITIONING (ONE-TIME)
  // ============================================
  // Track if we've done initial positioning for current train data
  const hasInitializedRef = useRef(false);
  const lastStationCountRef = useRef(0);

  useLayoutEffect(() => {
    if (!scrollRef.current || stations.length === 0) return;

    // Reset initialization flag when stations change (new train selected)
    if (lastStationCountRef.current !== stations.length) {
      hasInitializedRef.current = false;
      lastStationCountRef.current = stations.length;
    }

    // Only do initial positioning once per train
    // Auto-scroll effect will handle positioning to train icon
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // If train is running, skip initial scroll - let auto-scroll handle it
    if (isTrainRunning) return;

    const scrollTop = calculateInitialScrollTop(
      initialStationIndex,
      pillsPerStation,
      gapRatio,
      scrollRange,
      totalScrollHeight,
    );

    window.scrollTo({ top: scrollTop, behavior: "auto" });
  }, [
    scrollRef,
    stations.length,
    initialStationIndex,
    pillsPerStation,
    gapRatio,
    scrollRange,
    totalScrollHeight,
    isTrainRunning,
  ]);

  // ============================================
  // 7. AUTO-SCROLL FUNCTION
  // ============================================
  const performAutoScroll = useCallback(() => {
    const scrollTop = getAutoScrollTop({
      distanceFromOriginKm,
      currentStationSequence,
      stations,
      pillsPerStation,
      journeyDate,
      pillsBeforeFirstStation,
      currentLocationStatus,
      currentStationCode,
      gapRatio,
      scrollRange,
      totalScrollHeight,
    });

    smoothWindowScrollTo(scrollTop, 1000);
  }, [
    distanceFromOriginKm,
    currentStationSequence,
    stations,
    pillsPerStation,
    journeyDate,
    pillsBeforeFirstStation,
    currentLocationStatus,
    currentStationCode,
    gapRatio,
    scrollRange,
    totalScrollHeight,
  ]);

  // ============================================
  // 8. PHASE-BASED SCROLLING (CONTINUOUS)
  // ============================================
  const previousPhaseRef = useRef<TrainPhase | null>(null);
  const isScrollingRef = useRef(false);
  const lastScrolledPillIndexRef = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToKeepIconAtCenter = useCallback(
    (pillIndex: number) => {
      if (isScrollingRef.current) return;

      const targetScrollTop = calculateScrollTopForTrainPosition(
        pillIndex,
        PHASE_SCROLL_CONFIG.iconLockPosition,
        gapRatio,
        scrollRange,
        totalScrollHeight,
      );

      isScrollingRef.current = true;
      smoothWindowScrollTo(targetScrollTop, 750);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, PHASE_SCROLL_CONFIG.scrollDebounceMs);
    },
    [gapRatio, scrollRange, totalScrollHeight],
  );

  // Phase-based scroll effect
  useEffect(() => {
    if (!trainPillProgress || !isTrainRunning || !phaseInfo) return;

    const { absolutePillIndex } = trainPillProgress;

    // Log phase transitions
    if (previousPhaseRef.current !== currentPhase) {
      previousPhaseRef.current = currentPhase;
    }

    switch (currentPhase) {
      case "PHASE_1":
        // Train icon moves naturally, track stays still
        break;

      case "PHASE_2":
        // Continuously scroll to keep train at 50%
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
        // Train icon moves to end, track stays still
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
      cancelSmoothWindowScroll();
    };
  }, []);

  // ============================================
  // RETURN CONSOLIDATED API
  // ============================================
  return {
    scrollProgress,
    gapRatio,
    scrollRange,
    totalScrollHeight,
    trainPillProgress,
    performAutoScroll,
    isTrainRunning,
    currentPhase,
    phaseInfo,
  };
}
