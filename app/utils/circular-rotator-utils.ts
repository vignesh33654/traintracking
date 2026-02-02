import { getTrackPath, getPathTotalLength, getOuterTrackPath } from "./track-path";
import {
  TRACK_PATH_CONFIG,
  TIME_PATH_OFFSET,
  TIME_LABEL_VERTICAL_OFFSET,
  STATION_PATH_OFFSET,
  STATION_LABEL_VERTICAL_OFFSET,
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

const OUTER_PATH_CONFIG: PathConfig = {
  xOffset: -STATION_PATH_OFFSET,
  yOffsets: STATION_LABEL_VERTICAL_OFFSET,
  rotations: { left: 90, right: -90 },
  arcRotation: (t) => 90 - t * 180,
};

function calculatePathPosition(progress: number, config: PathConfig): PathPosition {
  const { leftRailX, rightRailX, railTop, arcStartY, arcRadius, arcCenterX, arcCenterY } =
    TRACK_PATH_CONFIG;
  const { straightLength, leftThreshold, rightThreshold } = trackThresholds;
  const { xOffset, yOffsets, rotations, arcRotation } = config;

  const radius = arcRadius - xOffset;

  // Handle progress < 0: extend upward from the left rail (off-screen above)
  if (progress < 0) {
    const t = progress / leftThreshold; // t will be negative
    return {
      x: leftRailX + xOffset,
      y: railTop + straightLength * t + yOffsets.left,
      rotation: rotations.left,
    };
  }

  // Handle progress > 1: extend upward from the right rail (off-screen above)
  if (progress > 1) {
    const t = (progress - rightThreshold) / (1 - rightThreshold); // t will be > 1
    return {
      x: rightRailX - xOffset,
      y: arcStartY - straightLength * t + yOffsets.right,
      rotation: rotations.right,
    };
  }

  // Normal case: progress is within [0, 1]
  if (progress < leftThreshold) {
    const t = progress / leftThreshold;
    return {
      x: leftRailX + xOffset,
      y: railTop + straightLength * t + yOffsets.left,
      rotation: rotations.left,
    };
  }

  if (progress < rightThreshold) {
    const t = (progress - leftThreshold) / (rightThreshold - leftThreshold);
    const angle = 180 - t * 180;
    const angleRad = (angle * Math.PI) / 180;
    return {
      x: arcCenterX + radius * Math.cos(angleRad),
      y: arcCenterY + radius * Math.sin(angleRad),
      rotation: arcRotation(t, angle),
    };
  }

  const t = (progress - rightThreshold) / (1 - rightThreshold);
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

export function getPositionOnOuterPath(progress: number): PathPosition {
  const path = getOuterTrackPath();

  if (!path || typeof path.getPointAtLength !== "function") {
    return calculatePathPosition(progress, OUTER_PATH_CONFIG);
  }

  try {
    const totalLength = path.getTotalLength();
    const distance = Math.max(0, Math.min(progress, 1)) * totalLength;
    const point = path.getPointAtLength(distance);

    const delta = 1;
    const nextPoint = path.getPointAtLength(Math.min(distance + delta, totalLength));
    const dx = nextPoint.x - point.x;
    const dy = nextPoint.y - point.y;
    const rotation = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

    return { x: point.x, y: point.y, rotation };
  } catch {
    return calculatePathPosition(progress, OUTER_PATH_CONFIG);
  }
}

export function getPositionOnPath(progress: number): PathPosition {
  // For progress outside [0, 1], use the fallback which extends the path
  if (progress < 0 || progress > 1) {
    return getPositionOnPathFallback(progress);
  }

  const path = getTrackPath();

  if (!path || typeof path.getPointAtLength !== "function") {
    return getPositionOnPathFallback(progress);
  }

  try {
    const totalLength = getPathTotalLength();
    const distance = progress * totalLength;
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
