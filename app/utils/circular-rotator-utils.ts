import { getTrackPath, getPathTotalLength } from "./track-path";
import { ARC_PILL_ROTATION_OFFSET_DEG, TRACK_PATH_CONFIG } from "../config/circular-rotator.config";

export interface PathPosition {
  x: number;
  y: number;
  rotation: number;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

// Smooth arc-only rotation tweak to improve visual readability on the curve.
function getArcRotationOffsetDeg(progress01: number): number {
  const { railTop, arcStartY, arcRadius } = TRACK_PATH_CONFIG;
  const straightLength = arcStartY - railTop;
  const arcLength = Math.PI * arcRadius;
  const totalLength = 2 * straightLength + arcLength;

  const leftThreshold = straightLength / totalLength;
  const rightThreshold = (straightLength + arcLength) / totalLength;
  const p = clamp01(progress01);
  if (p <= leftThreshold || p >= rightThreshold) return 0;

  const tArc = (p - leftThreshold) / (rightThreshold - leftThreshold); // 0..1 across arc
  const blend = Math.sin(Math.PI * tArc); // 0 at ends, 1 at middle
  return ARC_PILL_ROTATION_OFFSET_DEG * blend;
}

// Re-export for backward compatibility
export { getPathTotalLength };

// Calculates total item count by multiplying stations with items per segment
export function calculateItemCount(stationCount: number, itemsPerSegment = 1): number {
  return stationCount * itemsPerSegment;
}

// Fallback calculation for SSR using mathematical approach
function getPositionOnPathFallback(progress: number): PathPosition {
  // Arc center coordinates:
  // - arcCenterX: Horizontal center of the bottom arc (180px, not 180.5px from (41+320)/2)
  // - arcCenterY: Vertical position where arc begins (460px = arcStartY, the arc curves from this point)
  const { leftRailX, rightRailX, railTop, arcStartY, arcRadius, arcCenterX, arcCenterY } = TRACK_PATH_CONFIG;

  const straightLength = arcStartY - railTop;
  const arcLength = Math.PI * arcRadius;
  const totalLength = 2 * straightLength + arcLength;

  const leftThreshold = straightLength / totalLength;
  const rightThreshold = (straightLength + arcLength) / totalLength;

  const clampedProgress = clamp01(progress);

  // Left straight rail
  if (clampedProgress < leftThreshold) {
    const t = clampedProgress / leftThreshold;
    return {
      x: leftRailX,
      y: railTop + (arcStartY - railTop) * t,
      rotation: 0,
    };
  }

  // Bottom arc (180° to 0°)
  if (clampedProgress < rightThreshold) {
    const t = (clampedProgress - leftThreshold) / (rightThreshold - leftThreshold);
    const angle = 180 - t * 180;
    const angleRad = (angle * Math.PI) / 180;

    const baseRotation = angle >= 180 ? 180 - angle : angle;
    const rotationOffset = getArcRotationOffsetDeg(clampedProgress);

    return {
      x: arcCenterX + arcRadius * Math.cos(angleRad),
      y: arcCenterY + arcRadius * Math.sin(angleRad),
      rotation: baseRotation + rotationOffset,
    };
  }

  // Right straight rail
  const t = (clampedProgress - rightThreshold) / (1 - rightThreshold);
  return {
    x: rightRailX,
    y: arcStartY - (arcStartY - railTop) * t,
    rotation: 0,
  };
}

// Calculates exact position and rotation on the U-shaped track based on progress (0-1)
// Uses browser-native SVG path calculations when available, falls back to math for SSR
export function getPositionOnPath(progress: number): PathPosition {
  const path = getTrackPath();

  // Fallback to mathematical calculation if path not available or methods not supported
  if (!path || typeof path.getPointAtLength !== 'function') {
    return getPositionOnPathFallback(progress);
  }

  try {
    const totalLength = getPathTotalLength();
    const clampedProgress = clamp01(progress);
    const distance = clampedProgress * totalLength;

    // Browser calculates the position
    const point = path.getPointAtLength(distance);

    // Calculate rotation from tangent (sample a point slightly ahead)
    const delta = 1;
    const nextDistance = Math.min(distance + delta, totalLength);
    const nextPoint = path.getPointAtLength(nextDistance);

    const dx = nextPoint.x - point.x;
    const dy = nextPoint.y - point.y;
    const baseRotation = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    const rotationOffset = getArcRotationOffsetDeg(clampedProgress);
    const rotation = baseRotation + rotationOffset;

    return {
      x: point.x,
      y: point.y,
      rotation,
    };
  } catch {
    // Fall back to mathematical calculation if browser method fails
    return getPositionOnPathFallback(progress);
  }
}
