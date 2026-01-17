import TimePathText from "./TimePathText";
import { INNER_TRACK_CONFIG, OUTER_TRACK_CONFIG } from "../../../config/circular-rotator.config";
import type { TrackRailsProps } from "../../../types/circular-rotator.types";

export default function TrackRails({
  stations,
  scrollProgress,
  gapRatio,
  scrollRange,
  pillsPerStation,
}: TrackRailsProps) {
  return (
    <>
      <div
        className="absolute left-1/2 -translate-x-1/2 border border-bg-1 border-solid rounded-[334px]"
        style={{
          height: `${INNER_TRACK_CONFIG.height}px`,
          width: `${INNER_TRACK_CONFIG.width}px`,
          borderRadius: `${INNER_TRACK_CONFIG.borderRadius}px`,
          top: `${INNER_TRACK_CONFIG.top}px`,
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 border border-bg-1 border-solid rounded-[334px]"
        style={{
          height: `${OUTER_TRACK_CONFIG.height}px`,
          width: `${OUTER_TRACK_CONFIG.width}px`,
          borderRadius: `${OUTER_TRACK_CONFIG.borderRadius}px`,
          top: `${OUTER_TRACK_CONFIG.top}px`,
        }}
      />
      <TimePathText
        stations={stations}
        scrollProgress={scrollProgress}
        gapRatio={gapRatio}
        scrollRange={scrollRange}
        pillsPerStation={pillsPerStation}
      />
    </>
  );
}

