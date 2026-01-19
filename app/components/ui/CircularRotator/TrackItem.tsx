import { useMemo } from "react";
import PillItem from "../PillItem";
import StationCodeIcon from "../StationCodeIcon";
import { DistanceKm } from "../DistanceKm";
import { calculatePillPosition } from "../../../utils/circular-rotator-calculations";
import type { TrackItemProps } from "../../../types/circular-rotator.types";

export default function TrackItem({
  index,
  gapRatio,
  scrollRange,
  scrollProgress,
  stationName,
  stationCode,
  isActualStation,
  distanceFromSourceKm,
}: TrackItemProps) {
  
  const { x, y, rotation, isVisible } = useMemo(
    () => calculatePillPosition(index, scrollProgress, gapRatio, scrollRange),
    [scrollProgress, index, gapRatio, scrollRange]
  );

  const transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${rotation}deg)`;
  const opacity = isVisible ? 1 : 0;
  const counterRotate = `translate(-50%, -50%) rotate(${-rotation}deg)`;

  return (
    <div
      className="group absolute left-0 top-0 hover:z-50"
      style={{
        transform,
        transformOrigin: "center center",
        opacity,
        zIndex: isActualStation ? 1 : 0,
      }}
    >
      <PillItem isActualStation={isActualStation} />

      {isActualStation && stationCode && (
        <div
          className="absolute left-4.5 top-4 "
          style={{
            transform: counterRotate,
            transformOrigin: "center center",
            zIndex: 10,
          }}
        >
          <StationCodeIcon stationCode={stationCode} className="w-6 h-6" />
        </div>
      )}

      {isActualStation && stationName && (
        <div className="pointer-events-none absolute left-1/2 -top-8 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-bg-1 px-2 py-0.5 text-xs text-text-secondary opacity-0 transition-opacity group-hover:opacity-100">
          {stationName}
        </div>
      )}

      {distanceFromSourceKm !== undefined && (
        <div
          className="absolute left-4.5 top-4"
          style={{
            transform: counterRotate,
            transformOrigin: "center center",
          }}
        >
          <DistanceKm distanceFromOriginKm={distanceFromSourceKm} className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}

