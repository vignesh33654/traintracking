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

// Visual rail styling (CSS borders)
export const INNER_TRACK_CONFIG = {
  height: 744,
  width: 254,
  borderRadius: 334,
  top: -158,
} as const;

export const OUTER_TRACK_CONFIG = {
  height: 792,
  width: 306,
  borderRadius: 334,
  top: -178,
} as const;

// Time label path (positioned inside track)
export const TIME_TRACK_CONFIG = {
  leftRailX: 64,
  rightRailX: 296,
  railTop: 105,
  arcStartY: 555,
  arcRadius: 100,
  betweenStationsPercentage: 105,
} as const;

export const TIME_PATH_SVG_CONFIG = {
  width: 360,
  height: 700,
  top: "-100px",
} as const;
