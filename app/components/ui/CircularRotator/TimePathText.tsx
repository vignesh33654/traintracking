import { useMemo } from "react";
import { generateTimePathD, calculateTimeLabels } from "../../../utils/circular-rotator-calculations";
import type { TimePathTextProps } from "../../../types/circular-rotator.types";

export default function TimePathText({
  stations,
  scrollProgress,
  gapRatio,
  scrollRange,
  pillsPerStation,
}: TimePathTextProps) {
  const pathD = useMemo(() => generateTimePathD(), []);

  const timeLabels = useMemo(
    () => calculateTimeLabels(stations, scrollProgress, gapRatio, scrollRange, pillsPerStation),
    [stations, scrollProgress, gapRatio, scrollRange, pillsPerStation]
  );

  return (
    <svg
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
      width={360}
      height={700}
      style={{ top: -100 }}
      overflow="visible"
    >
      <defs>
        <path id="innerTrackTextPath" d={pathD} fill="none" />
      </defs>

      {timeLabels.map(({ id, time, offset, isVisible }, index) => (
        <text
          key={id}
          className="text-label"
          style={{
            fill: "var(--color-text-secondary)",
            opacity: isVisible ? 1 : 0,
          }}
        >
          <textPath href="#innerTrackTextPath" startOffset={`${offset}%`}>
            {index === 0 ? "" : time}
          </textPath>
        </text>
      ))}
    </svg>
  );
}
