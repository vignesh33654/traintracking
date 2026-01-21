"use client";

import { useMemo, useRef } from "react";
import { useTrainScroll } from "../../../hooks/useTrainScroll";
import { useNativeScroll } from "../../../hooks/useNativeScroll";
import { useScrollSound } from "../../../hooks/useScrollSound";
import { useInitialStationScroll } from "../../../hooks/useInitialStationScroll";
import { usePillPositions } from "../../../hooks/usePillPositions";
import { generatePillData } from "../../../utils/circular-rotator-calculations";
import { TRACK_CONTAINER_WIDTH, PILL_CONFIG } from "../../../config/circular-rotator.config";
import type { CircularRotatorProps } from "../../../types/circular-rotator.types";
import TrackItem from "./TrackItem";
import TrackRails from "./TrackRails";

export default function CircularRotator({
  stations,
  liveData,
  pillGap = PILL_CONFIG.gap,
  pillsPerStation = PILL_CONFIG.perStation,
}: CircularRotatorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useNativeScroll(scrollRef);

  const currentStationSequence = liveData?.currentLocation?.sequence;
  const isTrainRunning =
    liveData?.currentLocation?.status === "EN_ROUTE" ||
    liveData?.currentLocation?.status === "ARRIVED" ||
    liveData?.currentLocation?.status === "DEPARTED";

  const initialStationIndex =
    isTrainRunning && currentStationSequence ? currentStationSequence - 1 : 0;

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

  const pills = useMemo(
    () => generatePillData(itemCount, stations, pillsPerStation),
    [itemCount, stations, pillsPerStation]
  );

  const registerPillRef = usePillPositions({ gapRatio, scrollRange, scrollProgress });

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
        </div>
      </div>
    </div>
  );
}
