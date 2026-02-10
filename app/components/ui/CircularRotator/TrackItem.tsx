import { memo, type CSSProperties } from "react";
import PillItem from "../PillItem";
import StationCodeIcon from "../StationCodeIcon";
import StationTooltip from "../StationTooltip";
import { DistanceKm } from "../DistanceKm";
import { DayMarker } from "../DayMarker";
import { TOOLTIP_OFFSETS } from "../../../utils/pillTooltip";
import type { TrackItemProps } from "../../../types/circular-rotator.types";

const ICON_POSITION_CLASS = "absolute left-4.5 top-4.75 -translate-x-1/2 -translate-y-1/2";

const pillStyle: CSSProperties = {
  transform:
    "translate(var(--pill-x, 0px), var(--pill-y, 0px)) translate(-50%, -50%) rotate(var(--pill-rotation, 0deg))",
  transformOrigin: "center",
  opacity: "var(--pill-opacity, 0)",
};

const tooltipStyle: CSSProperties = {
  left: `var(--tooltip-offset-x, ${TOOLTIP_OFFSETS.right.x}px)`,
  top: `var(--tooltip-offset-y, ${TOOLTIP_OFFSETS.right.y}px)`,
  transform:
    "translate(var(--tooltip-translate-x, 0%), -50%) rotate(var(--pill-rotation-inverse, 0deg))",
  transformOrigin: "var(--tooltip-origin, left center)",
};

function TrackItem({
  index,
  stationName,
  stationCode,
  isActualStation,
  distanceFromSourceKm,
  dayNumber,
  scheduledDeparture,
  platform,
  day,
  registerPillRef,
}: TrackItemProps) {
  return (
    <div
      ref={(node) => registerPillRef(index, node)}
      className="group absolute left-0 top-0 cursor-default"
      style={{
        ...pillStyle,
        zIndex: isActualStation ? 1 : 0,
      }}
    >
      <PillItem />

      {isActualStation && stationCode && (
        <div className={ICON_POSITION_CLASS} style={{ zIndex: 10 }}>
          <StationCodeIcon stationCode={stationCode} className="w-6 h-6" />
        </div>
      )}

      {isActualStation && stationName && (() => {
        return (
          <div
            data-station-tooltip
            className="pointer-events-none absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-0 group-hover:delay-400 group-hover:duration-150"
            style={tooltipStyle}
          >
            <StationTooltip
              stationName={stationName}
              scheduledDeparture={scheduledDeparture}
              platform={platform}
              direction="right"
              day={day ?? 1}
            />
          </div>
        );
      })()}

      {distanceFromSourceKm !== undefined && (
        <div className={`${ICON_POSITION_CLASS} -z-10`}>
          <DistanceKm distanceFromOriginKm={distanceFromSourceKm} className="w-6 h-6"/>
        </div>
      )}

      {dayNumber !== undefined && (
        <div className= "absolute left-4.5 top-4.25 -translate-x-1/2 -translate-y-1/2 z-10 ">
          <DayMarker dayNumber={dayNumber} />
        </div>
      )}
    </div>
  );
}

export default memo(TrackItem);
