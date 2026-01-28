import { useId, useMemo } from "react";
import { calculateStationLabels } from "../../../utils/circular-rotator-calculations";
import {
  STATION_PATH_OFFSET,
  TRACK_CONTAINER_WIDTH,
  TRACK_VIEWPORT_HEIGHT,
} from "../../../config/circular-rotator.config";
import { generateOuterPath } from "../../../utils/track-path";
import type { StationPathTextProps } from "../../../types/circular-rotator.types";

export default function StationPathText({
  stations,
  scrollProgress,
  gapRatio,
  scrollRange,
  pillsPerStation,
}: StationPathTextProps) {
  const stationLabels = useMemo(
    () => calculateStationLabels(stations, scrollProgress, gapRatio, scrollRange, pillsPerStation),
    [stations, scrollProgress, gapRatio, scrollRange, pillsPerStation]
  );
  const stationPath = useMemo(() => generateOuterPath(STATION_PATH_OFFSET), []);
  const stationPathId = useId();

  return (
    <svg
      className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none select-none"
      width={TRACK_CONTAINER_WIDTH}
      height={TRACK_VIEWPORT_HEIGHT}
      viewBox={`0 0 ${TRACK_CONTAINER_WIDTH} ${TRACK_VIEWPORT_HEIGHT}`}
      aria-hidden
    >
      <defs>
        <path id={stationPathId} d={stationPath} />
      </defs>

      {stationLabels.map(({ id, label, startOffsetPercent, isVisible }) => (
        <text
          key={id}
          className="text-label"
          fill="var(--color-text-secondary)"
          opacity={isVisible ? 1 : 0}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          <textPath href={`#${stationPathId}`} startOffset={`${startOffsetPercent}%`}>
            {label}
          </textPath>
        </text>
      ))}
    </svg>
  );
}
