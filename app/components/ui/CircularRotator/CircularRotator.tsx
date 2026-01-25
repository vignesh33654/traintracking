"use client";

import { useRef, useCallback } from "react";
import { useScrollManager } from "../../../hooks/useScrollManager";
import { useScrollSound } from "../../../hooks/useScrollSound";
import { usePillPositions } from "../../../hooks/usePillPositions";
import { useTrainIconPosition } from "../../../hooks/useTrainIconPosition";
import { PILL_CONFIG } from "../../../config/circular-rotator.config";
import type { CircularRotatorProps } from "../../../types/circular-rotator.types";
import TrackContainer from "./TrackContainer";
import RefreshButton from "../RefreshButton";

export default function CircularRotator({
  stations,
  journeyDate,
  distanceFromOriginKm,
  currentLocationStatus,
  currentStationSequence,
  pillGap = PILL_CONFIG.gap,
  pillsPerStation = PILL_CONFIG.perStation,
  onRefresh,
  isRefreshing,
}: CircularRotatorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pillsBeforeFirstStation = PILL_CONFIG.pillsBeforeFirstStation;

  // Unified scroll management (replaces 5 separate hooks)
  const {
    scrollProgress,
    gapRatio,
    scrollRange,
    totalScrollHeight,
    trainPillProgress,
    performAutoScroll,
    isTrainRunning,
  } = useScrollManager({
    scrollRef,
    stations,
    distanceFromOriginKm,
    currentLocationStatus,
    currentStationSequence,
    journeyDate,
    pillGap,
    pillsPerStation,
    pillsBeforeFirstStation,
  });

  // Train icon visual position
  const trainIconPosition = useTrainIconPosition({
    distanceFromOriginKm,
    stations,
    pillsPerStation,
    gapRatio,
    scrollRange,
    scrollProgress,
    journeyDate,
    pillsBeforeFirstStation,
  });

  // Audio feedback during scroll
  const itemCount = stations.length * pillsPerStation;
  useScrollSound({ scrollProgress, gapRatio, scrollRange, itemCount });

  // Pill position tracking for animations
  const registerPillRef = usePillPositions({ gapRatio, scrollRange, scrollProgress });

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh();
      performAutoScroll();
    }
  }, [onRefresh, performAutoScroll]);

  return (
    <div ref={scrollRef} className="relative" style={{ height: totalScrollHeight }}>
      <div className="sticky top-0 w-full h-dvh flex items-center justify-center">
        <TrackContainer
          stations={stations}
          journeyDate={journeyDate}
          distanceFromOriginKm={distanceFromOriginKm}
          pillsPerStation={pillsPerStation}
          pillsBeforeFirstStation={pillsBeforeFirstStation}
          scrollProgress={scrollProgress}
          gapRatio={gapRatio}
          scrollRange={scrollRange}
          trainIconPosition={trainIconPosition}
          registerPillRef={registerPillRef}
        />
      </div>

      {onRefresh && (
        <RefreshButton onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      )}
    </div>
  );
}
