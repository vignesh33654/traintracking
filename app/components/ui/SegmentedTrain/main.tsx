"use client";

import { getProgressState } from "../../../utils/train-progress-utils";
import { TRAIN_CONFIG } from "../../../config/train.config";
import { useDark } from "../../../hooks/useDark";
import { useSegmentPositions } from "./hooks/useSegmentPositions";
import { useMaskSlice } from "./hooks/useMaskSlice";
import { useShadowSlice } from "./hooks/useShadowSlice";
import { TrainShadow } from "./components/TrainShadow";
import { TrainMask } from "./components/TrainMask";
import { TrainSegment } from "./components/TrainSegment";
import { TrainHeadlight } from "./components/TrainHeadlight";
import { StatusDot } from "../StatusDot";
import type { SegmentedTrainProps } from "./types/types";

/**
 * SegmentedTrain renders a 5-segment train that curves along the track path.
 * The engine (Part 1) is the anchor point positioned at engineProgress.
 * Other segments extend BEHIND the engine (earlier on the path).
 */
export function SegmentedTrain({
  engineProgress,
  backgroundColor = TRAIN_CONFIG.backgroundColor,
  isVisible = true,
  journeyDate,
  distanceFromOriginKm,
  showStatusDot = true,
  currentStationCode,
  destinationStationCode,
}: SegmentedTrainProps) {
  const { isDark } = useDark();
  const progressState = getProgressState(
    distanceFromOriginKm,
    currentStationCode,
    destinationStationCode,
  );

  // Calculate positions for all train segments
  const segmentPositions = useSegmentPositions(engineProgress);

  // Calculate mask and shadow slices for visual effects
  const maskSlice = useMaskSlice(segmentPositions);
  const shadowSlice = useShadowSlice(segmentPositions);

  if (!isVisible || !segmentPositions.length) return null;

  const enginePosition = segmentPositions[0];
  const { width, segments } = TRAIN_CONFIG;

  return (
    <>
      {/* Shadow behind the train (hidden in dark mode) */}
      {shadowSlice && <TrainShadow shadowSlice={shadowSlice} isDark={isDark} />}

      {/* Shared-path mask behind trailing cars to smooth curvature */}
      {maskSlice && (
        <TrainMask maskSlice={maskSlice} backgroundColor={backgroundColor} />
      )}

      {/* Render each train segment */}
      {segments.map((segment, index) => {
        const position = segmentPositions[index];
        return (
          <TrainSegment
            key={segment.name}
            file={segment.file}
            width={width}
            height={segment.height}
            x={position.x}
            y={position.y}
            rotation={position.rotation}
          />
        );
      })}

      {/* Headlight beam (dark mode only) - rotates with train direction */}
      {enginePosition && (
        <TrainHeadlight
          enginePosition={enginePosition}
          isDark={isDark}
          progressState={progressState}
        />
      )}

      {/* Status dot on the engine */}
      {showStatusDot && enginePosition && (
        <div
          className="absolute"
          style={{
            left: 0,
            top: 0,
            transform: `translate(${enginePosition.x}px, ${enginePosition.y}px) translate(-50%, -50%) rotate(${enginePosition.rotation - 180}deg)`,
            zIndex: 52,
          }}
        >
          <div
            className="relative"
            style={{ width, height: segments[0].height }}
          >
            <div className="absolute top-2.5 right-2.5">
              <StatusDot
                journeyDate={journeyDate}
                distanceFromOriginKm={distanceFromOriginKm}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
