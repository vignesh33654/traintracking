"use client";

import { create } from 'zustand';
import { AUDIO_CONFIG } from '../config/audio.config';

interface AudioSettings {
  isMuted: boolean;
  volume: number;
}

interface AudioState extends AudioSettings {
  prefersReducedMotion: boolean;
  isMobileDevice: boolean;
  toggleMute: () => void;
  setVolume: (value: number) => void;
  getEffectiveVolume: () => number;
  initializeFromStorage: () => void;
  setIsMobileDevice: (isMobile: boolean) => void;
}

const getStoredSettings = (): AudioSettings | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(AUDIO_CONFIG.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    return null;
  }
  return null;
};

const saveSettings = (settings: AudioSettings) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(AUDIO_CONFIG.STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage not available
  }
};

const getPrefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const useAudioStore = create<AudioState>((set, get) => ({
  isMuted: false,
  volume: AUDIO_CONFIG.DEFAULT_VOLUME,
  prefersReducedMotion: false,
  isMobileDevice: false,

  initializeFromStorage: () => {
    const stored = getStoredSettings();
    const prefersReducedMotion = getPrefersReducedMotion();
    
    if (stored) {
      set({
        isMuted: stored.isMuted,
        volume: Math.min(Math.max(stored.volume, AUDIO_CONFIG.MIN_VOLUME), AUDIO_CONFIG.MAX_VOLUME),
        prefersReducedMotion,
      });
    } else {
      set({ prefersReducedMotion });
    }
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    const newMuted = !isMuted;
    
    set({ isMuted: newMuted });
    saveSettings({ isMuted: newMuted, volume });
  },

  setVolume: (value: number) => {
    const clampedVolume = Math.min(Math.max(value, AUDIO_CONFIG.MIN_VOLUME), AUDIO_CONFIG.MAX_VOLUME);
    const { isMuted } = get();

    set({ volume: clampedVolume });
    saveSettings({ isMuted, volume: clampedVolume });
  },

  setIsMobileDevice: (isMobile: boolean) => {
    set({ isMobileDevice: isMobile });
  },

  getEffectiveVolume: () => {
    const { isMuted, volume, prefersReducedMotion, isMobileDevice } = get();
    const shouldDisableOnMobile = AUDIO_CONFIG.DISABLE_SCROLL_SOUND_ON_MOBILE && isMobileDevice;
    if (isMuted || prefersReducedMotion || shouldDisableOnMobile) return 0;
    return volume;
  },
}));

