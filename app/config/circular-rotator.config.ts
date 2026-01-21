export const TRACK_PATH_CONFIG = {
  leftRailX: 41,
  rightRailX: 320,
  railTop: 10,
  arcStartY: 460,
  arcRadius: 139,
  arcCenterX: 180,
  arcCenterY: 460,
} as const;

export const PILL_CONFIG = {
  gap: 28,
  perStation: 12,
} as const;

export const MILESTONE_CONFIG = {
  intervalKm: 150,
  pillOffsetBeforeStation: 4,
} as const;

export const TRACK_CONTAINER_WIDTH = 360;

export const TIME_PATH_OFFSET = 28;

// Vertical offset for time labels on straight rail sections
export const TIME_LABEL_VERTICAL_OFFSET = {
  left: 10,   // Offset on left rail (downward)
  right: -10, // Offset on right rail (upward)
} as const;
