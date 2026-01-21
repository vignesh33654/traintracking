// Track path coordinates for pill positions
export const TRACK_PATH_CONFIG = {
  leftRailX: 41,
  rightRailX: 320,
  railTop: 10,
  arcStartY: 460,
  arcRadius: 139,
  arcCenterX: 180,
  arcCenterY: 460,
} as const;

// Pill animation settings
export const PILL_CONFIG = {
  gap: 28,
  perStation: 12,
} as const;

// Distance milestone configuration
export const MILESTONE_CONFIG = {
  intervalKm: 100,
  pillOffsetBeforeStation: 4,
} as const;

// Container dimensions
export const TRACK_CONTAINER_WIDTH = 360;

// Time label inner offset (distance from track to inner time path)
export const TIME_PATH_OFFSET = 25;
