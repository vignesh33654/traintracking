import { memo, useMemo } from "react";
import PillItem from "../PillItem";
import StationCodeIcon from "../StationCodeIcon";
import { DistanceKm } from "../DistanceKm";
import { DayMarker } from "../DayMarker";
import { calculatePillPosition } from "../../../utils/circular-rotator-calculations";
import type { TrackItemProps } from "../../../types/circular-rotator.types";

const ICON_POSITION_CLASS = "absolute left-[18px] top-[19px] -translate-x-1/2 -translate-y-1/2";

function TrackItem({
  index,
  gapRatio,
  scrollRange,
  scrollProgress,
  stationName,
  stationCode,
  isActualStation,
  distanceFromSourceKm,
  dayNumber,
}: TrackItemProps) {
  
  const { x, y, rotation, isVisible } = useMemo(
    () => calculatePillPosition(index, scrollProgress, gapRatio, scrollRange),
    [scrollProgress, index, gapRatio, scrollRange]
  );

  const transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${rotation}deg)`;
  const opacity = isVisible ? 1 : 0;

  return (
    <div
      className="group absolute left-0 top-0 hover:z-10"
      style={{
        transform,
        transformOrigin: "center",
        opacity,
        zIndex: isActualStation ? 1 : 0,
      }}
    >
      <PillItem isActualStation={isActualStation} />

      {isActualStation && stationCode && (
        <div className={ICON_POSITION_CLASS} style={{ zIndex: 10 }}>
          <StationCodeIcon stationCode={stationCode} className="w-6 h-6" />
        </div>
      )}

      {isActualStation && stationName && (
        <div className="pointer-events-none absolute left-1/2 -top-8 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-bg-1 px-2 py-0.5 text-xs text-text-secondary opacity-0 transition-opacity group-hover:opacity-100">
          {stationName}
        </div>
      )}

      {distanceFromSourceKm !== undefined && (
        <div className={`${ICON_POSITION_CLASS} -z-10`}>
          <DistanceKm distanceFromOriginKm={distanceFromSourceKm} className="w-6 h-6"/>
        </div>
      )}

      {dayNumber !== undefined && (
        <div className= "absolute left-[18px] top-[19px] -translate-x-1/2 -translate-y-1/2 -z-10 ">
          <DayMarker dayNumber={dayNumber} />
        </div>
      )}
    </div>
  );
}

export default memo(TrackItem);

