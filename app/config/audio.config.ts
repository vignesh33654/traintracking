export const AUDIO_CONFIG = {
  STORAGE_KEY: 'audioSettings',
  DEFAULT_VOLUME: 0.5,
  MIN_VOLUME: 0.8,
  MAX_VOLUME: 1,
  PILL_TRIGGER_POSITION: 0.5, // Position on track (0-1) where pill triggers sound (0.5 = bottom center)
  POOL_SIZE: 5, // Number of audio elements in the pool for overlapping sounds
  TRIGGER_THRESHOLD: 0.1, // Symmetric threshold for pill detection at trigger position
  DISABLE_SCROLL_SOUND_ON_MOBILE: false, // Set to false to enable scroll sound on mobile
} as const;

export const SOUND_PATHS = {
  SCROLL: '/sounds/scroll.mp3',
} as const;

