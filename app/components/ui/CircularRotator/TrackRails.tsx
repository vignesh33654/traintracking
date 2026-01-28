import TimePathText from "./TimePathText";
import StationPathText from "./StationPathText";
import type { TrackRailsProps } from "../../../types/circular-rotator.types";

const TRACK_RAILS = [
  { height: 744, width: 254, top: -158 },
  { height: 792, width: 306, top: -178 },
  { height: 744, width: 198, top: -188 },
] as const;

export default function TrackRails({
  stations,
  scrollProgress,
  gapRatio,
  scrollRange,
  pillsPerStation,
}: TrackRailsProps) {
  return (
    <>
      {TRACK_RAILS.map((rail, i) => (
        <div
          key={i}
          className="absolute left-1/2 -translate-x-1/2 border border-bg-1 border-solid"
          style={{ ...rail, borderRadius: 334 }}
        />
      ))}
      <TimePathText
        stations={stations}
        scrollProgress={scrollProgress}
        gapRatio={gapRatio}
        scrollRange={scrollRange}
        pillsPerStation={pillsPerStation}
      />
      <StationPathText
        stations={stations}
        scrollProgress={scrollProgress}
        gapRatio={gapRatio}
        scrollRange={scrollRange}
        pillsPerStation={pillsPerStation}
      />
    </>
  );
}
