import { getTrackPath, getPathTotalLength } from "./track-path";
import { TRACK_PATH_CONFIG, TIME_PATH_OFFSET, TIME_LABEL_VERTICAL_OFFSET } from "../config/circular-rotator.config";

export interface PathPosition {
  x: number;
  y: number;
  rotation: number;
}

export { getPathTotalLength };

// Returns total items needed across all stations (stations × items per station)
export function calculateItemCount(stationCount: number, itemsPerSegment = 1): number {
  return stationCount * itemsPerSegment;
}

// Memoized track geometry - computed once since config values never change at runtime
const trackThresholds = (() => {
  const { railTop, arcStartY, arcRadius } = TRACK_PATH_CONFIG;
  const straightLength = arcStartY - railTop; // Height of each vertical rail
  const arcLength = Math.PI * arcRadius; // Half-circle perimeter (πr)
  const totalLength = 2 * straightLength + arcLength; // Full U-track length

  return {
    straightLength,
    leftThreshold: straightLength / totalLength, // Where left rail ends (~0.35)
    rightThreshold: (straightLength + arcLength) / totalLength, // Where arc ends (~0.65)
  };
})();

// Configuration for different path types
interface PathConfig {
  xOffset: number; // Horizontal inset from track edge
  yOffsets: { left: number; right: number }; // Vertical nudge for labels
  rotations: { left: number; right: number }; // Rotation on straight rails
  arcRotation: (t: number, angle: number) => number; // Rotation function for arc section
}

// Generic: Maps 0-1 progress to x,y,rotation on U-shaped track with configurable offsets
function calculatePathPosition(progress: number, config: PathConfig): PathPosition {
  const { leftRailX, rightRailX, railTop, arcStartY, arcRadius, arcCenterX, arcCenterY } = TRACK_PATH_CONFIG;
  const { straightLength, leftThreshold, rightThreshold } = trackThresholds;
  const { xOffset, yOffsets, rotations, arcRotation } = config;

  const clampedProgress = Math.max(0, Math.min(1, progress)); // Keep progress in 0-1 bounds
  const radius = arcRadius - xOffset;

  // Left rail: moves top to bottom
  if (clampedProgress < leftThreshold) {
    const t = clampedProgress / leftThreshold; // Normalize to 0-1 within segment
    return {
      x: leftRailX + xOffset,
      y: railTop + straightLength * t + yOffsets.left,
      rotation: rotations.left,
    };
  }

  // Arc: sweeps from left (180°) to right (0°)
  if (clampedProgress < rightThreshold) {
    const t = (clampedProgress - leftThreshold) / (rightThreshold - leftThreshold);
    const angle = 180 - t * 180; // 180° → 0° as t goes 0 → 1
    const angleRad = (angle * Math.PI) / 180;
    return {
      x: arcCenterX + radius * Math.cos(angleRad), // Circle parametric x
      y: arcCenterY + radius * Math.sin(angleRad), // Circle parametric y
      rotation: arcRotation(t, angle),
    };
  }

  // Right rail: moves bottom to top
  const t = (clampedProgress - rightThreshold) / (1 - rightThreshold);
  return {
    x: rightRailX - xOffset,
    y: arcStartY - straightLength * t + yOffsets.right,
    rotation: rotations.right,
  };
}

// Config for main track path (stations, icons)
const FALLBACK_PATH_CONFIG: PathConfig = {
  xOffset: 0,
  yOffsets: { left: 0, right: 0 },
  rotations: { left: 0, right: 0 },
  arcRotation: (_t, angle) => (angle >= 180 ? 180 - angle : angle), // V-shaped: 0° → 90° → 0°
};

// Config for inner path (time labels) - offset inward with perpendicular text
const INNER_PATH_CONFIG: PathConfig = {
  xOffset: TIME_PATH_OFFSET,
  yOffsets: TIME_LABEL_VERTICAL_OFFSET,
  rotations: { left: 90, right: -90 },
  arcRotation: (t, _angle) => 90 - t * 180, // Linear: 90° → -90°
};

// Fallback: Maps 0-1 progress to x,y on U-track when SVG path unavailable
function getPositionOnPathFallback(progress: number): PathPosition {
  return calculatePathPosition(progress, FALLBACK_PATH_CONFIG);
}

// Inner path for time labels: offset inward from track with perpendicular text rotation
export function getPositionOnInnerPath(progress: number): PathPosition {
  return calculatePathPosition(progress, INNER_PATH_CONFIG);
}

// Primary: Maps 0-1 progress to position using actual SVG path, falls back to geometric calc
export function getPositionOnPath(progress: number): PathPosition {
  const path = getTrackPath();

  if (!path || typeof path.getPointAtLength !== "function") {
    return getPositionOnPathFallback(progress);
  }

  try {
    const totalLength = getPathTotalLength();
    const distance = Math.max(0, Math.min(progress, 1)) * totalLength; // Convert progress to pixel distance
    const point = path.getPointAtLength(distance); // Get x,y at this distance

    // Calculate rotation by sampling a point slightly ahead on the path
    const delta = 1;
    const nextPoint = path.getPointAtLength(Math.min(distance + delta, totalLength));
    const dx = nextPoint.x - point.x;
    const dy = nextPoint.y - point.y;
    const rotation = Math.atan2(dy, dx) * (180 / Math.PI) + 90; // Tangent angle + 90° offset

    return { x: point.x, y: point.y, rotation };
  } catch {
    return getPositionOnPathFallback(progress);
  }
}
