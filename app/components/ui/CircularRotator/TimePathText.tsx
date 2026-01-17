import { useMemo } from "react";
import { generateTimePathD, calculateTimeLabels } from "../../../utils/circular-rotator-calculations";
import { TRACK_CONTAINER_WIDTH, TIME_PATH_SVG_CONFIG } from "../../../config/circular-rotator.config";
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
      width={TRACK_CONTAINER_WIDTH}
      height={TIME_PATH_SVG_CONFIG.height}
      style={{ top: TIME_PATH_SVG_CONFIG.top }}
      overflow="visible"
    >
      <defs>
        <path id="innerTrackTextPath" d={pathD} fill="none" />
      </defs>

      {timeLabels.map(({ id, time, offset, isVisible }) => (
        <text
          key={id}
          style={{
            fontFamily: "var(--font-circular-std), system-ui, sans-serif",
            fontSize: "10px",
            fontWeight: 400,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            fill: "var(--color-text-secondary)",
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.15s ease-out",
          }}
        >
          <textPath href="#innerTrackTextPath" startOffset={`${offset}%`}>
            {time}
          </textPath>
        </text>
      ))}
    </svg>
  );
}

