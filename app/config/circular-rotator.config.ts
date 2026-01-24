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
  pillsBeforeFirstStation: 2,
} as const;

export const MILESTONE_CONFIG = {
  intervalKm: 150,
  pillOffsetBeforeStation: 4,
} as const;

export const TRACK_CONTAINER_WIDTH = 360;

export const TRACK_VIEWPORT_HEIGHT = 600;

export const TIME_PATH_OFFSET = 28;

export const TIME_LABEL_VERTICAL_OFFSET = {
  left: 10,
  right: -10,
} as const;

export const TIME_LABEL_PILL_OFFSET = PILL_CONFIG.pillsBeforeFirstStation; // Adjust the arrival time label position manually here

export const AUTO_SCROLL_CONFIG = {
  targetViewportPercentFromBottom: 0.5, // 0.5 = 50% from bottom = middle of viewport
} as const;
