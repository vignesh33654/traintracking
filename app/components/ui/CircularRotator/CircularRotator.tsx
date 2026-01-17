"use client";

import { useRef, useMemo } from "react";
import { useTrainData } from "../../../hooks/useTrainData";
import { useTrainScroll } from "../../../hooks/useTrainScroll";
import { useNativeScroll } from "../../../hooks/useNativeScroll";
import { useScrollSound } from "../../../hooks/useScrollSound";
import { generatePillData } from "../../../utils/circular-rotator-calculations";
import { TRACK_CONTAINER_WIDTH } from "../../../config/circular-rotator.config";
import type { CircularRotatorProps } from "../../../types/circular-rotator.types";
import TrackItem from "./TrackItem";
import TrackRails from "./TrackRails";

export default function CircularRotator({
  trainNumber,
  pillGap = 28,
  pillsPerStation = 12,
}: CircularRotatorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useNativeScroll(scrollRef);

  const { data: trainData } = useTrainData(trainNumber);

  const stations = useMemo(() => trainData?.route || [], [trainData?.route]);

  const itemCount = useMemo(
    () => stations.length * pillsPerStation,
    [stations.length, pillsPerStation]
  );

  const { gapRatio, scrollRange, totalScrollHeight } = useTrainScroll(
    stations.length,
    pillGap,
    pillsPerStation
  );

  useScrollSound({ scrollProgress, gapRatio, scrollRange, itemCount });

  const pills = useMemo(
    () => generatePillData(itemCount, stations, pillsPerStation),
    [itemCount, stations, pillsPerStation]
  );

  return (
    <div ref={scrollRef} className="relative" style={{ height: `${totalScrollHeight}px` }}>
      <div className="sticky top-0 w-full h-screen flex items-center justify-center">
        <div
          className="relative h-full bg-bg-0"
          style={{ width: `${TRACK_CONTAINER_WIDTH}px` }}
        >
          <TrackRails
            stations={stations}
            scrollProgress={scrollProgress}
            gapRatio={gapRatio}
            scrollRange={scrollRange}
            pillsPerStation={pillsPerStation}
          />

          {pills.map(({ index, stationName, isActualStation }) => (
            <TrackItem
              key={index}
              index={index}
              gapRatio={gapRatio}
              scrollRange={scrollRange}
              scrollProgress={scrollProgress}
              stationName={stationName}
              isActualStation={isActualStation}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

