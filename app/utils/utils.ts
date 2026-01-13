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
  leftRailX: 58,
  rightRailX: 326,
  railTop: 10,
  arcStartY: 600,
  arcCenterX: 193,
  arcCenterY: 600,
  arcRadius: 133,
};

export function calculateItemCount(stationCount: number, itemsPerSegment: number = 5): number {
  return stationCount * itemsPerSegment;
}

export function getPathTotalLength(config: TrackConfig = TRACK_CONFIG): number {
  const leftRailLength = config.arcStartY - config.railTop;
  const rightRailLength = config.arcStartY - config.railTop;
  const arcLength = Math.PI * config.arcRadius;
  return leftRailLength + arcLength + rightRailLength;
}

export function calculateItemCountFromSpacing(spacing: number, config: TrackConfig = TRACK_CONFIG): number {
  const totalLength = getPathTotalLength(config);
  return Math.floor(totalLength / spacing);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export interface PathPosition {
  x: number;
  y: number;
  rotation: number;
}

export function getPositionOnPath(t: number, config: TrackConfig = TRACK_CONFIG): PathPosition {
  const { leftRailX, rightRailX, railTop, arcStartY, arcCenterX, arcCenterY, arcRadius } = config;
  
  const leftRailLength = arcStartY - railTop;
  const rightRailLength = arcStartY - railTop;
  const arcLength = Math.PI * arcRadius;
  const totalLength = leftRailLength + arcLength + rightRailLength;
  
  const leftRailEnd = leftRailLength / totalLength;
  const rightRailStart = (leftRailLength + arcLength) / totalLength;
  
  if (t < leftRailEnd) {
    const railT = t / leftRailEnd;
    return {
      x: leftRailX,
      y: lerp(railTop, arcStartY, railT),
      rotation: 0,
    };
  } else if (t < rightRailStart) {
    const arcT = (t - leftRailEnd) / (rightRailStart - leftRailEnd);
    const angle = 180 - arcT * 180;
    const angleRad = angle * DEG2RAD;
    
    const x = arcCenterX + arcRadius * Math.cos(angleRad);
    const y = arcCenterY + arcRadius * Math.sin(angleRad);
    
    let rotation: number;
    if (angle >= 180) {
      rotation = 180 - angle;
    } else {
      rotation = angle;
    }
    
    return { x, y, rotation };
  } else {
    const railT = (t - rightRailStart) / (1 - rightRailStart);
    return {
      x: rightRailX,
      y: lerp(arcStartY, railTop, railT),
      rotation: 0,
    };
  }
}

