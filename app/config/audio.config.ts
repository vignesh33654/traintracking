export const AUDIO_CONFIG = {
  STORAGE_KEY: 'audioSettings',
  DEFAULT_VOLUME: 0.5,
  MIN_VOLUME: 0.5,
  MAX_VOLUME: 1,
  PILL_TRIGGER_POSITION: 0.5, // Position on track (0-1) where pill triggers sound (0.5 = bottom center)
  POOL_SIZE: 5, // Number of audio elements in the pool for overlapping sounds
  TRIGGER_THRESHOLD: 0.1, // Symmetric threshold for pill detection at trigger position
  DISABLE_SCROLL_SOUND_ON_MOBILE: true, // Set to false to enable scroll sound on mobile
  STATUS_SOUND_DELAY_MS: 1000, // Delay in ms before playing status sound after results load
} as const;

export const SOUND_PATHS = {
  SCROLL: '/sounds/scroll.mp3',
  NOT_STARTED: '/sounds/not-started.mp3',
  DESTINATION_REACHED: '/sounds/destination-reached.mp3',
  HORN: '/sounds/horn.mp3',
} as const;

