"use client";

import Image from "next/image";
import { useId, useMemo } from "react";
import { getPositionOnPath } from "../../../utils/circular-rotator-utils";
import { getProgressState } from "../../../utils/train-progress-utils";
import { TRAIN_CONFIG } from "../../../config/train.config";
import { TrainSegment } from "./TrainSegment";
import { StatusDot } from "../StatusDot";
import { TRACK_CONTAINER_WIDTH, TRACK_VIEWPORT_HEIGHT } from "../../../config/circular-rotator.config";
import { U_SHAPED_TRACK_PATH } from "../../../utils/track-path";
import { PATH_LENGTH, PROGRESS_OFFSETS, clamp01 } from "./utils";
import { useDark } from "../../../hooks/useDark";
import type { SegmentedTrainProps, SegmentPosition } from "./types";

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
  const shadowFilterId = useId();
  const { isDark } = useDark();
  const progressState = getProgressState(distanceFromOriginKm, currentStationCode, destinationStationCode);

  const segmentPositions = useMemo<SegmentPosition[]>(() => {
    return TRAIN_CONFIG.segments.map((_, index) => {
      const clampedProgress = clamp01(engineProgress - (PROGRESS_OFFSETS[index] ?? 0));
      const position = getPositionOnPath(clampedProgress);
      return { ...position, progress: clampedProgress };
    });
  }, [engineProgress]);

  const maskSlice = useMemo(() => {
    if (!TRAIN_CONFIG.mask?.enabled || !segmentPositions.length || !PATH_LENGTH) return null;

    const progresses = segmentPositions.map((p) => p.progress);
    const minProgress = Math.min(...progresses);
    const maxProgress = Math.max(...progresses);

    const rawLength = (maxProgress - minProgress) * PATH_LENGTH;
    if (rawLength <= 0) return null;

    const gapsBetween = Math.max(0, segmentPositions.length - 1);
    const gapTotal = (TRAIN_CONFIG.mask.gapPx ?? 0) * gapsBetween;
    const adjustedLength = Math.max(0, rawLength - gapTotal);

    // Spread the removed length evenly to keep slight gaps without losing alignment
    const startDistance = minProgress * PATH_LENGTH + gapTotal / 2;
    const dasharray = `${adjustedLength} ${PATH_LENGTH}`;
    // Negative offset aligns the dash start with the train's trailing slice direction
    const dashoffset = -startDistance;

    return { dasharray, dashoffset, minProgress, maxProgress };
  }, [segmentPositions]);

  // Shadow slice uses the same calculation as mask but with shadow config
  const shadowSlice = useMemo(() => {
    if (!TRAIN_CONFIG.shadow?.enabled || !segmentPositions.length || !PATH_LENGTH) return null;

    const progresses = segmentPositions.map((p) => p.progress);
    const minProgress = Math.min(...progresses);
    const maxProgress = Math.max(...progresses);

    const rawLength = (maxProgress - minProgress) * PATH_LENGTH;
    if (rawLength <= 0) return null;

    const startDistance = minProgress * PATH_LENGTH;
    const dasharray = `${rawLength} ${PATH_LENGTH}`;
    const dashoffset = -startDistance;

    return { dasharray, dashoffset };
  }, [segmentPositions]);

  if (!isVisible || !segmentPositions.length) return null;

  const { width, segments, mask, shadow, headlight } = TRAIN_CONFIG;
  const enginePosition = segmentPositions[0];
  const maskColor = mask?.color ?? backgroundColor;

  return (
    <>
      {/* Shadow behind the train (hidden in dark mode) */}
      {shadow?.enabled && shadowSlice && !isDark && (
        <svg
          className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none select-none"
          width={TRACK_CONTAINER_WIDTH}
          height={TRACK_VIEWPORT_HEIGHT}
          viewBox={`0 0 ${TRACK_CONTAINER_WIDTH} ${TRACK_VIEWPORT_HEIGHT}`}
          style={{ zIndex: shadow.zIndex }}
          aria-hidden
        >
          <defs>
            <filter id={shadowFilterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={shadow.blur} />
            </filter>
          </defs>
          <path
            d={U_SHAPED_TRACK_PATH}
            fill="none"
            stroke={shadow.color}
            strokeWidth={shadow.width}
            strokeLinecap="round"
            strokeDasharray={shadowSlice.dasharray}
            strokeDashoffset={shadowSlice.dashoffset}
            opacity={shadow.opacity}
            filter={`url(#${shadowFilterId})`}
            transform={`translate(${shadow.offsetX}, ${shadow.offsetY})`}
          />
        </svg>
      )}

      {/* Shared-path mask behind trailing cars to smooth curvature */}
      {maskSlice && (
        <svg
          className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none select-none"
          width={TRACK_CONTAINER_WIDTH}
          height={TRACK_VIEWPORT_HEIGHT}
          viewBox={`0 0 ${TRACK_CONTAINER_WIDTH} ${TRACK_VIEWPORT_HEIGHT}`}
          style={{ zIndex: 50 }}
          aria-hidden
        >
          <path
            d={U_SHAPED_TRACK_PATH}
            fill="none"
            stroke={maskColor}
            strokeWidth={width}
            strokeLinecap="round"
            strokeDasharray={maskSlice.dasharray}
            strokeDashoffset={maskSlice.dashoffset}
            opacity={mask?.opacity ?? 1}
          />
        </svg>
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
      {headlight?.enabled && enginePosition && (!headlight.darkModeOnly || isDark) && progressState === "in-progress" && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: 0,
            top: 0,
            transform: `translate(${enginePosition.x}px, ${enginePosition.y}px) translate(-50%, -50%) rotate(${enginePosition.rotation - 180}deg) translateY(${headlight.offsetY}px)`,
            width: headlight.width,
            height: headlight.height,
            zIndex: headlight.zIndex,
            opacity: headlight.opacity,
          }}
        >
          <Image
            src={headlight.file}
            alt=""
            width={headlight.width}
            height={headlight.height}
            priority
            className="pointer-events-none"
          />
        </div>
      )}

      {/* Status dot on the engine */}
      {showStatusDot && enginePosition && (
        <div
          className="absolute"
          style={{
            left: 0,
            top: 0,
            // Adjust rotation same as segments: subtract 180° from path rotation
            transform: `translate(${enginePosition.x}px, ${enginePosition.y}px) translate(-50%, -50%) rotate(${enginePosition.rotation - 180}deg)`,
            zIndex: 52,
          }}
        >
          <div className="relative" style={{ width, height: segments[0].height }}>
            <div className="absolute top-[10px] right-[9px]">
              <StatusDot journeyDate={journeyDate} distanceFromOriginKm={distanceFromOriginKm} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
