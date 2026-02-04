"use client";

import { useRef, useCallback, useEffect } from "react";
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
  distanceFromLastStationKm,
  currentStationCode,
  lastUpdatedAt,
  destinationStationCode,
  route,
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
    performAutoScroll,
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
    currentLocationStatus,
    currentStationCode,
  });

  // Audio feedback during scroll
  const itemCount = stations.length * pillsPerStation;
  useScrollSound({ scrollProgress, gapRatio, scrollRange, itemCount });

  // Pill position tracking for animations (virtualized - only updates visible pills)
  const registerPillRef = usePillPositions({ gapRatio, scrollRange, scrollProgress, totalItems: itemCount });

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh();
      performAutoScroll();
    }
  }, [onRefresh, performAutoScroll]);

  // Auto-scroll when fresh data arrives (page load, refresh, or train selection)
  useEffect(() => {
    const hasLivePosition = distanceFromOriginKm !== null || currentStationSequence !== null;
    if (!hasLivePosition) return;
    performAutoScroll();
  }, [distanceFromOriginKm, currentStationSequence, journeyDate, performAutoScroll]);

  return (
    <div ref={scrollRef} className="relative overflow-x-clip" style={{ height: totalScrollHeight }}>
      <div className="sticky top-0 w-full h-dvh flex items-center justify-center overflow-x-hidden">
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
          distanceFromLastStationKm={distanceFromLastStationKm}
          currentStationCode={currentStationCode}
          lastUpdatedAt={lastUpdatedAt}
          destinationStationCode={destinationStationCode}
          currentLocationStatus={currentLocationStatus}
          currentSequence={currentStationSequence}
          route={route}
        />
      </div>

      {onRefresh && (
        <RefreshButton onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      )}
    </div>
  );
}
