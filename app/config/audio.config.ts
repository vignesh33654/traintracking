export const AUDIO_CONFIG = {
  STORAGE_KEY: 'audioSettings',
  DEFAULT_VOLUME: 0,
  MIN_VOLUME: 0.7,
  MAX_VOLUME: 1,
  
  // Scroll sound timing
  SCROLL_DEBOUNCE_MS: 150,      // Time after last scroll event to consider scroll "ended"
  LOOP_THRESHOLD_MS: 200,       // Time of continuous scrolling before switching to loop mode
} as const;

export const SOUND_PATHS = {
  SCROLL: '/sounds/scroll.mp3',
  SCROLL_LOOP: '/sounds/scroll-loop.mp3',
} as const;

