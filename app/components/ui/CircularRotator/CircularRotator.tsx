"use client";

import { useMemo, useRef, useCallback } from "react";
import { useTrainScroll } from "../../../hooks/useTrainScroll";
import { useNativeScroll } from "../../../hooks/useNativeScroll";
import { useScrollSound } from "../../../hooks/useScrollSound";
import { useInitialStationScroll } from "../../../hooks/useInitialStationScroll";
import { usePillPositions } from "../../../hooks/usePillPositions";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { useMobileActiveStation } from "../../../hooks/useMobileActiveStation";
import { useTrainIconPosition } from "../../../hooks/useTrainIconPosition";
import { usePhaseScroll } from "../../../hooks/usePhaseScroll";
import { generatePillData } from "../../../utils/circular-rotator-calculations";
import { calculatePillProgress } from "../../../utils/train-scroll-calculator";
import { TRACK_CONTAINER_WIDTH, PILL_CONFIG } from "../../../config/circular-rotator.config";
import type { CircularRotatorProps } from "../../../types/circular-rotator.types";
import {
  getAutoScrollTop,
  getInitialStationIndex,
  isTrainRunningStatus,
} from "../../../utils/train-auto-scroll";
import { calculateTrainPillIndex } from "../../../utils/train-position-utils";
import TrackItem from "./TrackItem";
import TrackRails from "./TrackRails";
import MobileStationTooltip from "./MobileStationTooltip";
import { TrainIcon } from "../TrainIcon";
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
  const scrollProgress = useNativeScroll(scrollRef);

  const isTrainRunning = isTrainRunningStatus(currentLocationStatus);
  const initialStationIndex = getInitialStationIndex(
    isTrainRunning,
    currentStationSequence
  );

  const itemCount = stations.length * pillsPerStation;

  const { gapRatio, scrollRange, totalScrollHeight } = useTrainScroll(
    stations.length,
    pillGap,
    pillsPerStation
  );

  useScrollSound({ scrollProgress, gapRatio, scrollRange, itemCount });
  useInitialStationScroll({
    scrollRef,
    stationsLength: stations.length,
    initialStationIndex,
    pillsPerStation,
    gapRatio,
    scrollRange,
    totalScrollHeight,
  });

  const pillsBeforeFirstStation = PILL_CONFIG.pillsBeforeFirstStation;

  const pills = useMemo(
    () => generatePillData(itemCount, stations, pillsPerStation, pillsBeforeFirstStation),
    [itemCount, stations, pillsPerStation, pillsBeforeFirstStation]
  );

  const registerPillRef = usePillPositions({ gapRatio, scrollRange, scrollProgress });

  const isMobile = useIsMobile();
  const activeStation = useMobileActiveStation(
    scrollProgress,
    stations,
    pillsPerStation,
    gapRatio,
    scrollRange,
    pillsBeforeFirstStation
  );

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

  const trainPillProgress = useMemo(() => {
    if (distanceFromOriginKm === null || stations.length === 0) return null;
    const { absolutePillIndex, isValid } = calculateTrainPillIndex(
      distanceFromOriginKm,
      stations,
      pillsPerStation,
      journeyDate,
      pillsBeforeFirstStation
    );
    if (!isValid) return null;
    return {
      absolutePillIndex,
      ...calculatePillProgress(
        absolutePillIndex,
        scrollProgress,
        gapRatio,
        scrollRange
      ),
    };
  }, [
    distanceFromOriginKm,
    stations,
    pillsPerStation,
    journeyDate,
    pillsBeforeFirstStation,
    scrollProgress,
    gapRatio,
    scrollRange,
  ]);

  // 3-Phase scroll behavior:
  // Phase 1: Train icon moves 0% → 50% (track stays still)
  // Phase 2: Track scrolls to keep train at 50% (until lastStation - 2)
  // Phase 3: Train icon moves 50% → 100% (track stays still)
  usePhaseScroll({
    trainPillProgress,
    totalStations: stations.length,
    pillsPerStation,
    pillsBeforeFirstStation,
    gapRatio,
    scrollRange,
    totalScrollHeight,
    isTrainRunning,
  });

  const performAutoScroll = useCallback(() => {
    const scrollTop = getAutoScrollTop({
      distanceFromOriginKm,
      currentStationSequence,
      isTrainRunning,
      stations,
      pillsPerStation,
      journeyDate,
      pillsBeforeFirstStation,
      gapRatio,
      scrollRange,
      totalScrollHeight,
    });
    window.scrollTo({ top: scrollTop, behavior: "smooth" });
  }, [
    distanceFromOriginKm,
    currentStationSequence,
    isTrainRunning,
    stations,
    pillsPerStation,
    journeyDate,
    pillsBeforeFirstStation,
    gapRatio,
    scrollRange,
    totalScrollHeight,
  ]);

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh();
      performAutoScroll();
    }
  }, [onRefresh, performAutoScroll]);

  return (
    <div ref={scrollRef} className="relative" style={{ height: totalScrollHeight }}>
      <div className="sticky top-0 w-full h-dvh flex items-center justify-center">
        <div
          className="relative h-full bg-bg-0"
          style={{ width: TRACK_CONTAINER_WIDTH }}
        >
          <TrackRails
            stations={stations}
            scrollProgress={scrollProgress}
            gapRatio={gapRatio}
            scrollRange={scrollRange}
            pillsPerStation={pillsPerStation}
          />

          {pills.map(({ index, stationName, stationCode, isActualStation, distanceFromSourceKm, dayNumber, scheduledDeparture, platform, day }) => (
            <TrackItem
              key={index}
              index={index}
              stationName={stationName}
              stationCode={stationCode}
              isActualStation={isActualStation}
              distanceFromSourceKm={distanceFromSourceKm}
              dayNumber={dayNumber}
              scheduledDeparture={scheduledDeparture}
              platform={platform}
              day={day}
              registerPillRef={registerPillRef}
            />
          ))}

          {isMobile && activeStation && (
            <MobileStationTooltip
              stationName={activeStation.stationName}
              stationCode={activeStation.stationCode}
              scheduledDeparture={activeStation.scheduledDeparture}
              platform={activeStation.platform}
              day={activeStation.day}
              gapRatio={gapRatio}
            />
          )}

          {trainIconPosition.isVisible && (
            <TrainIcon
              journeyDate={journeyDate}
              distanceFromOriginKm={distanceFromOriginKm}
              x={trainIconPosition.x}
              y={trainIconPosition.y}
              rotation={trainIconPosition.rotation}
              counterRotation={trainIconPosition.counterRotation}
              isOnTrack={true}
            />
          )}
        </div>
      </div>

      {onRefresh && (
        <RefreshButton onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      )}
    </div>
  );
}
