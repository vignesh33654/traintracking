
export type ProgressState = "not-started" | "in-progress" | "complete";

/**
 * Determines if train journey is not started, in progress, or complete
 */
export function getProgressState(
  distanceFromOriginKm: number | null | undefined,
  currentStationCode: string | null | undefined,
  destinationStationCode: string | undefined
): ProgressState {
  // Check if reached destination first
  if (
    currentStationCode &&
    destinationStationCode &&
    currentStationCode === destinationStationCode
  ) {
    return "complete";
  }

  // Check if train has started
  if (distanceFromOriginKm != null && distanceFromOriginKm > 0) {
    return "in-progress";
  }

  return "not-started";
}

/**
 * Calculates journey completion percentage (0-100%)
 */
export function calculatePercentage(
  state: ProgressState,
  distanceFromOriginKm: number | null | undefined,
  totalDistanceKm: number
): number {
  if (state === "complete") {
    return 100;
  }

  if (state === "not-started" || totalDistanceKm <= 0) {
    return 0;
  }

  const percentage = ((distanceFromOriginKm ?? 0) / totalDistanceKm) * 100;
  return Math.min(100, Math.max(0, percentage));
}

/**
 * Generates the SVG path data for drawing the circular progress arc
 *
 * @param centerX - X coordinate of the circle's center
 * @param centerY - Y coordinate of the circle's center
 * @param radius - Radius of the circle
 * @param startAngleDegrees - Starting angle in degrees (0 is at 12 o'clock)
 * @param endAngleDegrees - Ending angle in degrees
 * @returns SVG path data string
 */
export function generateProgressArcPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngleDegrees: number,
  endAngleDegrees: number
): string {
  const start = angleToXY(centerX, centerY, radius, endAngleDegrees);
  const end = angleToXY(centerX, centerY, radius, startAngleDegrees);
  const largeArcFlag = endAngleDegrees - startAngleDegrees <= 180 ? "0" : "1";

  return [
    "M", centerX, centerY,
    "L", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "Z"
  ].join(" ");
}

/**
 * Converts an angle and distance into X and Y screen coordinates
 * Helper function for SVG path calculations
 *
 * @param centerX - X coordinate of the origin point
 * @param centerY - Y coordinate of the origin point
 * @param radius - Distance from the origin
 * @param angleDegrees - Angle in degrees (0 is at 12 o'clock, increases clockwise)
 * @returns Object with x and y coordinates
 */
function angleToXY(
  centerX: number,
  centerY: number,
  radius: number,
  angleDegrees: number
) {
  // Convert to radians and adjust so 0 degrees is at 12 o'clock
  const angleInRadians = ((angleDegrees + 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}
