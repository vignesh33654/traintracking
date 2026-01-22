import StationTooltip from "../StationTooltip";
import { TRACK_PATH_CONFIG, PILL_CONFIG } from "../../../config/circular-rotator.config";
import { getPositionOnPath } from "../../../utils/circular-rotator-utils";

interface MobileStationTooltipProps {
  stationName: string;
  stationCode: string;
  scheduledDeparture?: string;
  platform: string;
  day: number;
  gapRatio: number;
}

export default function MobileStationTooltip({
  stationName,
  scheduledDeparture,
  platform,
  day,
  gapRatio,
}: MobileStationTooltipProps) {
  
  const firstStationPillIndex = PILL_CONFIG.pillsBeforeFirstStation + 0.5; // 0.5 pill offset for the mobile tooltip
  const checkpointProgress = firstStationPillIndex * gapRatio;
  const position = getPositionOnPath(checkpointProgress);
  const tooltipX = position.x + 18; // left offset for the mobile tooltip
  const tooltipY = position.y;

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        left: tooltipX,
        top: tooltipY,
        transform: "translateY(-50%)",
      }}
    >
      <StationTooltip
        stationName={stationName}
        scheduledDeparture={scheduledDeparture}
        platform={platform}
        direction="right"
        day={day}
      />
    </div>
  );
}
