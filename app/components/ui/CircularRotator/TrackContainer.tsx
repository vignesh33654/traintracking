import { useMemo } from "react";
import { generatePillData } from "../../../utils/circular-rotator-calculations";
import { TRACK_CONTAINER_WIDTH } from "../../../config/circular-rotator.config";
import type { RouteStation, CurrentLocation } from "../../../types/train.types";
import type { PillData } from "../../../types/circular-rotator.types";
import TrackItem from "./TrackItem";
import TrackRails from "./TrackRails";
import { TrainIcon } from "../TrainIcon";
import { TrainStatus } from "../TrainStatus";

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
  distanceFromLastStationKm?: number | null;
  currentStationCode?: string | null;
  lastUpdatedAt?: string | null;
  destinationStationCode?: string;
  currentLocationStatus?: CurrentLocation["status"] | null;
  currentSequence?: number | null;
  route?: RouteStation[];
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
  distanceFromLastStationKm,
  currentStationCode,
  lastUpdatedAt,
  destinationStationCode,
  currentLocationStatus,
  currentSequence,
  route,
}: TrackContainerProps) {
  const itemCount = stations.length * pillsPerStation;

  const pills = useMemo(
    () => generatePillData(itemCount, stations, pillsPerStation, pillsBeforeFirstStation),
    [itemCount, stations, pillsPerStation, pillsBeforeFirstStation]
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

      <TrainStatus
        lastUpdatedAt={lastUpdatedAt}
        currentLocationStatus={currentLocationStatus}
        distanceFromLastStationKm={distanceFromLastStationKm}
        distanceFromOriginKm={distanceFromOriginKm}
        currentStationCode={currentStationCode}
        currentSequence={currentSequence}
        route={route}
        destinationStationCode={destinationStationCode}
      />
    </div>
  );
}
