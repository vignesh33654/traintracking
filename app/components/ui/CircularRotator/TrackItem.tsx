import { memo, useMemo } from "react";
import PillItem from "../PillItem";
import StationCodeIcon from "../StationCodeIcon";
import StationTooltip from "../StationTooltip";
import { DistanceKm } from "../DistanceKm";
import { DayMarker } from "../DayMarker";
import { calculatePillPosition } from "../../../utils/circular-rotator-calculations";
import { TRACK_PATH_CONFIG } from "../../../config/circular-rotator.config";
import type { TrackItemProps } from "../../../types/circular-rotator.types";

type TooltipDirection = "left" | "right";

const ICON_POSITION_CLASS = "absolute left-[18px] top-[19px] -translate-x-1/2 -translate-y-1/2";

const getTooltipDirection = (x: number): TooltipDirection => {
  const { leftRailX, rightRailX } = TRACK_PATH_CONFIG;
  const midX = (leftRailX + rightRailX) / 2;
  return x < midX ? "left" : "right";
};

// Tooltip offset values - tweak these to adjust positioning
const TOOLTIP_OFFSETS = {
  left: { x: 38, y: 20 },   // left direction tooltip position
  right: { x: 38, y: 19 },  // right direction tooltip position
};

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
  scheduledDeparture,
  platform,
  day,
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

      {isActualStation && stationName && scheduledDeparture && platform && (() => {
        const direction = getTooltipDirection(x);
        const offset = TOOLTIP_OFFSETS[direction];
        return (
          <div
            className="pointer-events-none absolute z-50 opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              left: `${offset.x}px`,
              top: `${offset.y}px`,
              transform: `translate(${direction === 'left' ? '-100%' : '0'}, -50%) rotate(${-rotation}deg)`,
              transformOrigin: direction === 'left' ? 'right center' : 'left center',
            }}
          >
            <StationTooltip
              stationName={stationName}
              scheduledDeparture={scheduledDeparture}
              platform={platform}
              direction={direction}
              day={day ?? 1}
            />
          </div>
        );
      })()}

      {distanceFromSourceKm !== undefined && (
        <div className={ICON_POSITION_CLASS} style={{ zIndex: -10 }}>
          <DistanceKm distanceFromOriginKm={distanceFromSourceKm} className="w-6 h-6"/>
        </div>
      )}

      {dayNumber !== undefined && (
        <div className= "absolute left-[18px] top-[19px] -translate-x-1/2 -translate-y-1/2 z-10 ">
          <DayMarker dayNumber={dayNumber} />
        </div>
      )}
    </div>
  );
}

export default memo(TrackItem);

