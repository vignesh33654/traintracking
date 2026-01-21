import { getTrackPath, getPathTotalLength } from "./track-path";
import {
  TRACK_PATH_CONFIG,
  TIME_PATH_OFFSET,
  TIME_LABEL_VERTICAL_OFFSET,
} from "../config/circular-rotator.config";

export interface PathPosition {
  x: number;
  y: number;
  rotation: number;
}

export { getPathTotalLength };

interface PathConfig {
  xOffset: number;
  yOffsets: { left: number; right: number };
  rotations: { left: number; right: number };
  arcRotation: (t: number, angle: number) => number;
}

const trackThresholds = (() => {
  const { railTop, arcStartY, arcRadius } = TRACK_PATH_CONFIG;
  const straightLength = arcStartY - railTop;
  const arcLength = Math.PI * arcRadius;
  const totalLength = 2 * straightLength + arcLength;

  return {
    straightLength,
    leftThreshold: straightLength / totalLength,
    rightThreshold: (straightLength + arcLength) / totalLength,
  };
})();

const FALLBACK_PATH_CONFIG: PathConfig = {
  xOffset: 0,
  yOffsets: { left: 0, right: 0 },
  rotations: { left: 0, right: 0 },
  arcRotation: (_t, angle) => (angle >= 180 ? 180 - angle : angle),
};

const INNER_PATH_CONFIG: PathConfig = {
  xOffset: TIME_PATH_OFFSET,
  yOffsets: TIME_LABEL_VERTICAL_OFFSET,
  rotations: { left: 90, right: -90 },
  arcRotation: (t) => 90 - t * 180,
};

function calculatePathPosition(progress: number, config: PathConfig): PathPosition {
  const { leftRailX, rightRailX, railTop, arcStartY, arcRadius, arcCenterX, arcCenterY } =
    TRACK_PATH_CONFIG;
  const { straightLength, leftThreshold, rightThreshold } = trackThresholds;
  const { xOffset, yOffsets, rotations, arcRotation } = config;

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const radius = arcRadius - xOffset;

  if (clampedProgress < leftThreshold) {
    const t = clampedProgress / leftThreshold;
    return {
      x: leftRailX + xOffset,
      y: railTop + straightLength * t + yOffsets.left,
      rotation: rotations.left,
    };
  }

  if (clampedProgress < rightThreshold) {
    const t = (clampedProgress - leftThreshold) / (rightThreshold - leftThreshold);
    const angle = 180 - t * 180;
    const angleRad = (angle * Math.PI) / 180;
    return {
      x: arcCenterX + radius * Math.cos(angleRad),
      y: arcCenterY + radius * Math.sin(angleRad),
      rotation: arcRotation(t, angle),
    };
  }

  const t = (clampedProgress - rightThreshold) / (1 - rightThreshold);
  return {
    x: rightRailX - xOffset,
    y: arcStartY - straightLength * t + yOffsets.right,
    rotation: rotations.right,
  };
}

function getPositionOnPathFallback(progress: number): PathPosition {
  return calculatePathPosition(progress, FALLBACK_PATH_CONFIG);
}

export function getPositionOnInnerPath(progress: number): PathPosition {
  return calculatePathPosition(progress, INNER_PATH_CONFIG);
}

export function getPositionOnPath(progress: number): PathPosition {
  const path = getTrackPath();

  if (!path || typeof path.getPointAtLength !== "function") {
    return getPositionOnPathFallback(progress);
  }

  try {
    const totalLength = getPathTotalLength();
    const distance = Math.max(0, Math.min(progress, 1)) * totalLength;
    const point = path.getPointAtLength(distance);

    const delta = 1;
    const nextPoint = path.getPointAtLength(Math.min(distance + delta, totalLength));
    const dx = nextPoint.x - point.x;
    const dy = nextPoint.y - point.y;
    const rotation = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

    return { x: point.x, y: point.y, rotation };
  } catch {
    return getPositionOnPathFallback(progress);
  }
}
