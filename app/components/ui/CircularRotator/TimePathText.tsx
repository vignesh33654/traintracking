import { useMemo } from "react";
import { calculateTimeLabels } from "../../../utils/circular-rotator-calculations";
import { TRACK_CONTAINER_WIDTH, TRACK_VIEWPORT_HEIGHT } from "../../../config/circular-rotator.config";
import type { TimePathTextProps } from "../../../types/circular-rotator.types";

export default function TimePathText({
  stations,
  scrollProgress,
  gapRatio,
  scrollRange,
  pillsPerStation,
}: TimePathTextProps) {
  const timeLabels = useMemo(
    () => calculateTimeLabels(stations, scrollProgress, gapRatio, scrollRange, pillsPerStation),
    [stations, scrollProgress, gapRatio, scrollRange, pillsPerStation]
  );

  return (
    <div
      className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none"
      style={{ width: TRACK_CONTAINER_WIDTH, height: TRACK_VIEWPORT_HEIGHT }}
    >
      {timeLabels.map(({ id, time, x, y, rotation, isVisible }) => (
        <div
          key={id}
          className="absolute text-label whitespace-nowrap"
          style={{
            color: "var(--color-text-secondary)",
            opacity: isVisible ? 1 : 0,
            transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${rotation}deg)`,
            transformOrigin: "center",
          }}
        >
          {time}
        </div>
      ))}
    </div>
  );
}
