const DEG2RAD = Math.PI / 180;

interface TrackConfig {
  leftRailX: number;
  rightRailX: number;
  railTop: number;
  arcStartY: number;
  arcCenterX: number;
  arcCenterY: number;
  arcRadius: number;
}

export const TRACK_CONFIG: TrackConfig = {
  leftRailX: 41,
  rightRailX: 320,
  railTop: 10,
  arcStartY: 460,
  arcCenterX: 180,
  arcCenterY: 460,
  arcRadius: 139,
};

// Calculates total item count by multiplying stations with items per segment
export function calculateItemCount(stationCount: number, itemsPerSegment = 1): number {
  return stationCount * itemsPerSegment;
}

// Calculates total track length by adding both straight rails and the bottom arc
export function getPathTotalLength(config: TrackConfig = TRACK_CONFIG): number {
  const straightLength = config.arcStartY - config.railTop;
  const arcLength = Math.PI * config.arcRadius;
  return 2 * straightLength + arcLength;
}

// Blends between start and end values based on amount (0 = start, 1 = end)
function linearInterpolation(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}


export interface PathPosition {
  x: number;
  y: number;
  rotation: number;
}

// Calculates exact position and rotation on the U-shaped track based on progress (0-1)
export function getPositionOnPath(progress: number, config: TrackConfig = TRACK_CONFIG): PathPosition {
  const { leftRailX, rightRailX, railTop, arcStartY, arcCenterX, arcCenterY, arcRadius } = config;
  
  const straightLength = arcStartY - railTop;
  const arcLength = Math.PI * arcRadius;
  const totalLength = 2 * straightLength + arcLength;
  
  const leftThreshold = straightLength / totalLength;
  const rightThreshold = (straightLength + arcLength) / totalLength;
  
  // Left straight rail
  if (progress < leftThreshold) {
    const t = progress / leftThreshold;
    return {
      x: leftRailX,
      y: linearInterpolation(railTop, arcStartY, t),
      rotation: 0,
    };
  }
  
  // Bottom arc (180° to 0°)
  if (progress < rightThreshold) {
    const t = (progress - leftThreshold) / (rightThreshold - leftThreshold);
    const angle = 180 - t * 180;
    const angleRad = angle * DEG2RAD;
    
    return {
      x: arcCenterX + arcRadius * Math.cos(angleRad),
      y: arcCenterY + arcRadius * Math.sin(angleRad),
      rotation: angle >= 180 ? 180 - angle : angle,
    };
  }
  
  // Right straight rail
  const t = (progress - rightThreshold) / (1 - rightThreshold);
  return {
    x: rightRailX,
    y: linearInterpolation(arcStartY, railTop, t),
    rotation: 0,
  };
}


