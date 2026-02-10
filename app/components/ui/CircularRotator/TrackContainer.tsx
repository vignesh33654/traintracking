import { useMemo } from "react";
import { generatePillData } from "../../../utils/circular-rotator-calculations";
import { calculateVisibleRange } from "../../../utils/train-scroll-calculator";
import { TRACK_CONTAINER_WIDTH } from "../../../config/circular-rotator.config";
import type { RouteStation, CurrentLocation } from "../../../types/train.types";
import type { PillData } from "../../../types/circular-rotator.types";
import TrackItem from "./TrackItem";
import TrackRails from "./TrackRails";
import { SegmentedTrain } from "../SegmentedTrain";
import { TrainStatus } from "../TrainStatus";

interface TrainIconPositionData {
  x: number;
  y: number;
  rotation: number;
  counterRotation: number;
  progress: number;
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
  currentStationDelayMinutes?: number | null;
  userActionTrigger: number;
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
  currentStationDelayMinutes,
  userActionTrigger,
}: TrackContainerProps) {
  const itemCount = stations.length * pillsPerStation;

  const pills = useMemo(
    () => generatePillData(itemCount, stations, pillsPerStation, pillsBeforeFirstStation),
    [itemCount, stations, pillsPerStation, pillsBeforeFirstStation]
  );

  const { startIndex, endIndex } = calculateVisibleRange(
    scrollProgress,
    gapRatio,
    scrollRange,
    itemCount,
    15 // extra items just before and after the screen so scrolling feels smoother
  );

  const visiblePills = useMemo(
    () => pills.filter((pill: PillData) => pill.index >= startIndex && pill.index <= endIndex),
    [pills, startIndex, endIndex]
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

      {visiblePills.map((pill: PillData) => (
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

      <SegmentedTrain
        engineProgress={trainIconPosition.isVisible ? trainIconPosition.progress : 0}
        isVisible={trainIconPosition.isVisible}
        journeyDate={journeyDate}
        distanceFromOriginKm={distanceFromOriginKm}
        currentStationCode={currentStationCode}
        destinationStationCode={destinationStationCode}
        currentLocationStatus={currentLocationStatus}
        distanceFromLastStationKm={distanceFromLastStationKm}
        currentSequence={currentSequence}
        route={route}
        lastUpdatedAt={lastUpdatedAt}
        currentStationDelayMinutes={currentStationDelayMinutes}
        userActionTrigger={userActionTrigger}
      />

      <TrainStatus
        lastUpdatedAt={lastUpdatedAt}
        currentLocationStatus={currentLocationStatus}
        distanceFromLastStationKm={distanceFromLastStationKm}
        distanceFromOriginKm={distanceFromOriginKm}
        currentStationCode={currentStationCode}
        currentSequence={currentSequence}
        route={route}
        destinationStationCode={destinationStationCode}
        isTrainVisible={trainIconPosition.isVisible}
        currentStationDelayMinutes={currentStationDelayMinutes}
      />
    </div>
  );
}
