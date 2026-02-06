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
  pillsBeforeFirstStation: 4,
} as const;

export const MILESTONE_CONFIG = {
  intervalKm: 300,
  pillOffsetBeforeStation: 2,
} as const;

export const TRACK_CONTAINER_WIDTH = 360;

export const TRACK_VIEWPORT_HEIGHT = 660;

export const TIME_PATH_OFFSET = -29;

export const TIME_LABEL_VERTICAL_OFFSET = {
  left: 10,
  right: -10,
} as const;

export const TIME_LABEL_PILL_OFFSET = PILL_CONFIG.pillsBeforeFirstStation + 0.5; // Adjust the arrival time label position manually here

export const STATION_PATH_OFFSET = -29;

export const STATION_LABEL_VERTICAL_OFFSET = {
  left: 10,
  right: -10,
} as const;

export const STATION_LABEL_PILL_OFFSET = PILL_CONFIG.pillsBeforeFirstStation + 0.5;

export const AUTO_SCROLL_CONFIG = {
  targetViewportPercentFromBottom: 0.5, // 0.5 = 50% from bottom = middle of viewport
} as const;

export const PHASE_SCROLL_CONFIG = {
  iconLockPosition: 0.5, // Keep train icon at 50% of viewport during Phase 2
  phase2EndStationsFromLast: 2, // Stop Phase 2 at lastStation - 2
  scrollThreshold: 0.5, // Minimum pill movement before triggering scroll update
  scrollDebounceMs: 300, // Debounce time for scroll animations
} as const;

export const TOOLTIP_OFFSETS = {
  left: { x: 28, y: 20 },
  right: { x: 28, y: 19 },
} as const;

export const TRAIN_PROGRESS_CONFIG = {
  svgSize: 24,
  innerRadius: 8,
  strokeWidth: 1,
  center: 12,
} as const;
