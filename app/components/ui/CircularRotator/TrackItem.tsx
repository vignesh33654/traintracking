import { useMemo } from "react";
import PillItem from "../PillItem";
import { calculatePillPosition } from "../../../utils/circular-rotator-calculations";
import type { TrackItemProps } from "../../../types/circular-rotator.types";

export default function TrackItem({
  index,
  gapRatio,
  scrollRange,
  scrollProgress,
  stationName,
  isActualStation,
}: TrackItemProps) {
  const { x, y, rotation, isVisible } = useMemo(
    () => calculatePillPosition(index, scrollProgress, gapRatio, scrollRange),
    [scrollProgress, index, gapRatio, scrollRange]
  );

  const transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${rotation}deg)`;
  const opacity = isVisible ? 1 : 0;

  return (
    <div
      className="absolute left-0 top-0 hover:z-50"
      style={{
        transform,
        transformOrigin: "center center",
        opacity,
        zIndex: isActualStation ? 1 : 0,
      }}
    >
      <PillItem
        stationName={stationName}
        isActualStation={isActualStation}
        rotation={rotation}
      />
    </div>
  );
}

