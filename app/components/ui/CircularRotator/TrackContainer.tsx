import { useMemo } from "react";
import { generatePillData } from "../../../utils/circular-rotator-calculations";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { useMobileActiveStation } from "../../../hooks/useMobileActiveStation";
import { TRACK_CONTAINER_WIDTH } from "../../../config/circular-rotator.config";
import type { RouteStation } from "../../../types/train.types";
import type { PillData } from "../../../types/circular-rotator.types";
import TrackItem from "./TrackItem";
import TrackRails from "./TrackRails";
import MobileStationTooltip from "./MobileStationTooltip";
import { TrainIcon } from "../TrainIcon";

interface TrainIconPositionData {
  x: number;
  y: number;
  rotation: number;
  counterRotation: number;
  isVisible: boolean;
}

interface TrackContainerProps {
  stations: RouteStation[];
  journeyDate: string | null;
  distanceFromOriginKm: number | null;
  pillsPerStation: number;
  pillsBeforeFirstStation: number;
  scrollProgress: number;
  gapRatio: number;
  scrollRange: number;
  trainIconPosition: TrainIconPositionData;
  registerPillRef: (index: number, node: HTMLDivElement | null) => void;
}

export default function TrackContainer({
  stations,
  journeyDate,
  distanceFromOriginKm,
  pillsPerStation,
  pillsBeforeFirstStation,
  scrollProgress,
  gapRatio,
  scrollRange,
  trainIconPosition,
  registerPillRef,
}: TrackContainerProps) {
  const itemCount = stations.length * pillsPerStation;
  const isMobile = useIsMobile();

  const pills = useMemo(
    () => generatePillData(itemCount, stations, pillsPerStation, pillsBeforeFirstStation),
    [itemCount, stations, pillsPerStation, pillsBeforeFirstStation]
  );

  const activeStation = useMobileActiveStation(
    scrollProgress,
    stations,
    pillsPerStation,
    gapRatio,
    scrollRange,
    pillsBeforeFirstStation
  );

  return (
    <div
      className="relative h-full bg-bg-0"
      style={{ width: TRACK_CONTAINER_WIDTH }}
    >
      <TrackRails
        stations={stations}
        scrollProgress={scrollProgress}
        gapRatio={gapRatio}
        scrollRange={scrollRange}
        pillsPerStation={pillsPerStation}
      />

      {pills.map((pill: PillData) => (
        <TrackItem
          key={pill.index}
          index={pill.index}
          stationName={pill.stationName}
          stationCode={pill.stationCode}
          isActualStation={pill.isActualStation}
          distanceFromSourceKm={pill.distanceFromSourceKm}
          dayNumber={pill.dayNumber}
          scheduledDeparture={pill.scheduledDeparture}
          platform={pill.platform}
          day={pill.day}
          registerPillRef={registerPillRef}
        />
      ))}

      {isMobile && activeStation && (
        <MobileStationTooltip
          stationName={activeStation.stationName}
          stationCode={activeStation.stationCode}
          scheduledDeparture={activeStation.scheduledDeparture}
          platform={activeStation.platform}
          day={activeStation.day}
          gapRatio={gapRatio}
        />
      )}

      {trainIconPosition.isVisible && (
        <TrainIcon
          journeyDate={journeyDate}
          distanceFromOriginKm={distanceFromOriginKm}
          x={trainIconPosition.x}
          y={trainIconPosition.y}
          rotation={trainIconPosition.rotation}
          counterRotation={trainIconPosition.counterRotation}
          isOnTrack={true}
        />
      )}
    </div>
  );
}
