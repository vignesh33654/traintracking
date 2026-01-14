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

export function calculateItemCount(stationCount: number, itemsPerSegment: number = 5): number {
  return stationCount * itemsPerSegment;
  console.log(calculateItemCount);  
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

// Interpolates between start and end by amount (0-1)
function simpleLinearInterpolation(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

export interface PathPosition {
  x: number;
  y: number;
  rotation: number;
}


// Calculates item position (x, y, rotation) on the track based on progress (0-1)
// Track: Left Straight -> Bottom Curve -> Right Straight
export function getPositionOnPath(progress: number, config: TrackConfig = TRACK_CONFIG): PathPosition {
  const { leftRailX, rightRailX, railTop, arcStartY, arcCenterX, arcCenterY, arcRadius } = config;
  
  // Track segment lengths
  const leftStraightLineLength = arcStartY - railTop;
  const rightStraightLineLength = arcStartY - railTop;
  const curvedPartLength = Math.PI * arcRadius;
  const totalTrackLength = leftStraightLineLength + curvedPartLength + rightStraightLineLength;
  
  // Progress thresholds
  const endOfLeftLine = leftStraightLineLength / totalTrackLength;
  const startOfRightLine = (leftStraightLineLength + curvedPartLength) / totalTrackLength;
  
  // Case 1: Left straight line
  if (progress < endOfLeftLine) {
    const lineProgress = progress / endOfLeftLine;
    return {
      x: leftRailX,
      y: simpleLinearInterpolation(railTop, arcStartY, lineProgress),
      rotation: 0,
    };
  } 
  // Case 2: Bottom curve
  else if (progress < startOfRightLine) {
    const curveProgress = (progress - endOfLeftLine) / (startOfRightLine - endOfLeftLine);
    
    // 180 to 0 degrees
    const angle = 180 - curveProgress * 180;
    const angleInRadians = angle * DEG2RAD;
    
    const x = arcCenterX + arcRadius * Math.cos(angleInRadians);
    const y = arcCenterY + arcRadius * Math.sin(angleInRadians);
    
    // Rotate item to match curve
    const rotation = angle >= 180 ? 180 - angle : angle;
    
    return { x, y, rotation };
  } 
  // Case 3: Right straight line
  else {
    const lineProgress = (progress - startOfRightLine) / (1 - startOfRightLine);
    return {
      x: rightRailX,
      y: simpleLinearInterpolation(arcStartY, railTop, lineProgress),
      rotation: 0,
    };
  }
}

