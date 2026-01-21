import { useMemo } from "react";
import { calculateTimeLabels } from "../../../utils/circular-rotator-calculations";
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
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
      style={{ width: 360, height: 600, top: 0 }}
    >
      {timeLabels.map(({ id, time, x, y, rotation, isVisible }, index) => (
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
