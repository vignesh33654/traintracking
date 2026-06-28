"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { getProgressState } from "../../../utils/train-progress-utils";
import { getStatusMessage } from "../../../utils/train-status.utils";
import { formatDelay } from "../../../utils/time-formatters";
import { TRAIN_CONFIG } from "../../../config/train.config";
import { TRACK_PATH_CONFIG } from "../../../config/circular-rotator.config";
import { useDark } from "../../../hooks/useDark";
import { useSegmentPositions } from "./hooks/useSegmentPositions";
import { useMaskSlice } from "./hooks/useMaskSlice";
import { useShadowSlice } from "./hooks/useShadowSlice";
import { TrainShadow } from "./components/TrainShadow";
import { TrainMask } from "./components/TrainMask";
import { TrainSegment } from "./components/TrainSegment";
import { TrainHeadlight } from "./components/TrainHeadlight";
import { StatusDot } from "../StatusDot";
import Tooltip, { TOOLTIP_TIMING } from "../Tooltip";
import { useSound } from "../../../hooks/useSound";
import { SOUND_PATHS } from "../../../config/audio.config";
import type { SegmentedTrainProps } from "./types/types";

// progress (0-1) → tooltip position based on train location on track
function getTooltipVariant(
  progress: number,
): "left" | "right" | "top" | "bottom" {
  const { railTop, arcStartY, arcRadius } = TRACK_PATH_CONFIG;
  const straightLength = arcStartY - railTop;
  const arcLength = Math.PI * arcRadius;
  const totalLength = 2 * straightLength + arcLength;
  const leftThreshold = straightLength / totalLength;
  const rightThreshold = (straightLength + arcLength) / totalLength;

  if (progress < leftThreshold) return "left";
  if (progress > rightThreshold) return "right";
  return "top";
}

export function SegmentedTrain({
  engineProgress,
  backgroundColor = TRAIN_CONFIG.backgroundColor,
  isVisible = true,
  journeyDate,
  distanceFromOriginKm,
  showStatusDot = true,
  currentStationCode,
  destinationStationCode,
  currentLocationStatus,
  distanceFromLastStationKm,
  currentSequence,
  route,
  currentStationDelayMinutes,
  userActionTrigger,
  onTooltipShown,
}: SegmentedTrainProps) {
  const { isDark } = useDark();
  const progressState = getProgressState(
    distanceFromOriginKm,
    currentStationCode,
    destinationStationCode,
  );

  const statusMessage = getStatusMessage({
    currentLocationStatus,
    distanceFromLastStationKm,
    distanceFromOriginKm,
    currentStationCode,
    currentSequence,
    route,
    destinationStationCode,
  });
  const hasReachedDestination = currentStationCode === destinationStationCode;
  const delay = hasReachedDestination
    ? null
    : formatDelay(currentStationDelayMinutes);
  const tooltipVariant = getTooltipVariant(engineProgress);

  const { play: playNotStarted } = useSound(SOUND_PATHS.NOT_STARTED, 1);
  const { play: playDestinationReached } = useSound(
    SOUND_PATHS.DESTINATION_REACHED, 1,
  );

  const playStatusSound = useCallback(() => {
    if (statusMessage === "NOT STARTED YET") playNotStarted();
    else if (statusMessage === "REACHED YOUR DESTINATION")
      playDestinationReached();
  }, [statusMessage, playNotStarted, playDestinationReached]);

  const [showTooltip, setShowTooltip] = useState(false);
  const showTooltipRef = useRef(false);
  const timersRef = useRef<{
    show: ReturnType<typeof setTimeout>;
    hide: ReturnType<typeof setTimeout>;
  } | null>(null);
  const lastProcessedTriggerRef = useRef(0);

  useEffect(() => {
    if (timersRef.current) {
      clearTimeout(timersRef.current.show);
      clearTimeout(timersRef.current.hide);
      timersRef.current = null;
    }
    if (showTooltipRef.current) {
      showTooltipRef.current = false;
      queueMicrotask(() => setShowTooltip(false));
    }

    if (!isVisible || userActionTrigger === 0) return;
    if (userActionTrigger === lastProcessedTriggerRef.current) return;
    lastProcessedTriggerRef.current = userActionTrigger;

    timersRef.current = {
      show: setTimeout(() => {
        showTooltipRef.current = true;
        setShowTooltip(true);
        playStatusSound();
      }, TOOLTIP_TIMING.SHOW_DELAY_MS),
      hide: setTimeout(() => {
        showTooltipRef.current = false;
        setShowTooltip(false);
      }, TOOLTIP_TIMING.SHOW_DELAY_MS + TOOLTIP_TIMING.VISIBLE_DURATION_MS),
    };

    onTooltipShown?.();

    return () => {
      if (timersRef.current) {
        clearTimeout(timersRef.current.show);
        clearTimeout(timersRef.current.hide);
      }
    };
  }, [userActionTrigger, isVisible, onTooltipShown, playStatusSound]);

  useEffect(() => {
    if (!showTooltip) return;

    const dismiss = () => {
      showTooltipRef.current = false;
      setShowTooltip(false);
      if (timersRef.current) {
        clearTimeout(timersRef.current.show);
        clearTimeout(timersRef.current.hide);
        timersRef.current = null;
      }
    };

    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [showTooltip]);

  const segmentPositions = useSegmentPositions(engineProgress);
  const maskSlice = useMaskSlice(segmentPositions);
  const shadowSlice = useShadowSlice(segmentPositions);

  if (!isVisible || !segmentPositions.length) return null;

  const enginePosition = segmentPositions[0];
  const { width, segments } = TRAIN_CONFIG;

  return (
    <div>
      {shadowSlice && <TrainShadow shadowSlice={shadowSlice} isDark={isDark} />}

      {maskSlice && (
        <TrainMask maskSlice={maskSlice} backgroundColor={backgroundColor} />
      )}

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

      {enginePosition && (
        <TrainHeadlight
          enginePosition={enginePosition}
          isDark={isDark}
          progressState={progressState}
        />
      )}

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
                currentStationCode={currentStationCode}
                currentSequence={currentSequence}
                route={route}
              />
            </div>
          </div>
        </div>
      )}

      {showTooltip && enginePosition && (
        <div
          className="absolute"
          style={{
            left: 0,
            top: 0,
            transform: `translate(${enginePosition.x}px, ${enginePosition.y}px)`,
            zIndex: 53,
          }}
        >
          <div
            style={{
              transform:
                tooltipVariant === "left"
                  ? "translate(13px, -50%)"
                  : tooltipVariant === "right"
                    ? "translate(-100%, -50%)"
                    : "translate(-50%, 13px)",
            }}
          >
            <Tooltip
              label={statusMessage}
              delay={delay}
              variant={tooltipVariant}
            />
          </div>
        </div>
      )}
    </div>
  );
}
