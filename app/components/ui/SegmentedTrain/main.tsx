"use client";

import { useRef, useState, useEffect } from "react";
import { getProgressState } from "../../../utils/train-progress-utils";
import { getStatusMessage } from "../../../utils/train-status.utils";
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
import type { SegmentedTrainProps } from "./types/types";

// progress (0-1) → tooltip position based on train location on track
function getTooltipVariant(progress: number): "left" | "right" | "top" | "bottom" {
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
  startObservingTooltip,
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

  const tooltipVariant = getTooltipVariant(engineProgress);

  const [showTooltip, setShowTooltip] = useState(false);
  const timersRef = useRef<{ show: ReturnType<typeof setTimeout>; hide: ReturnType<typeof setTimeout> } | null>(null);
  const trainRef = useRef<HTMLDivElement>(null);
  const [tooltipTrigger, setTooltipTrigger] = useState(0);

  useEffect(() => {
    if (!isVisible || !startObservingTooltip || !trainRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTooltipTrigger((c) => c + 1);
            onTooltipShown();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(trainRef.current);

    return () => observer.disconnect();
  }, [isVisible, startObservingTooltip, onTooltipShown]);

  useEffect(() => {
    if (tooltipTrigger === 0) return;

    if (timersRef.current) {
      clearTimeout(timersRef.current.show);
      clearTimeout(timersRef.current.hide);
    }

    const reset = setTimeout(() => setShowTooltip(false), 0);
    timersRef.current = {
      show: setTimeout(() => setShowTooltip(true), TOOLTIP_TIMING.SHOW_DELAY_MS),
      hide: setTimeout(() => setShowTooltip(false), TOOLTIP_TIMING.SHOW_DELAY_MS + TOOLTIP_TIMING.VISIBLE_DURATION_MS),
    };

    return () => {
      clearTimeout(reset);
      if (timersRef.current) {
        clearTimeout(timersRef.current.show);
        clearTimeout(timersRef.current.hide);
      }
    };
  }, [tooltipTrigger]);

  const segmentPositions = useSegmentPositions(engineProgress);
  const maskSlice = useMaskSlice(segmentPositions);
  const shadowSlice = useShadowSlice(segmentPositions);

  if (!isVisible || !segmentPositions.length) return null;

  const enginePosition = segmentPositions[0];
  const { width, segments } = TRAIN_CONFIG;

  return (
    <div ref={trainRef}>
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
                    : "translate(-50%, 13px)"
            }}
          >
            <Tooltip label={statusMessage} variant={tooltipVariant} />
          </div>
        </div>
      )}
    </div>
  );
}
