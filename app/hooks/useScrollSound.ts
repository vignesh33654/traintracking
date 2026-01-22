"use client";

import { useEffect, useRef } from 'react';
import { useSound } from './useSound';
import { AUDIO_CONFIG, SOUND_PATHS } from '../config/audio.config';
import { calculatePillProgress } from '../utils/train-scroll-calculator';

interface UseScrollSoundParams {
  scrollProgress: number;
  gapRatio: number;
  scrollRange: number;
  itemCount: number;
}

export function useScrollSound({ scrollProgress, gapRatio, scrollRange, itemCount }: UseScrollSoundParams) {
  const lastPillAtTrigger = useRef<number>(-1);
  const isInitialized = useRef(false);

  const { play } = useSound(SOUND_PATHS.SCROLL);

  useEffect(() => {
    if (itemCount === 0) return;

    const triggerPosition = AUDIO_CONFIG.PILL_TRIGGER_POSITION;
    const threshold = AUDIO_CONFIG.TRIGGER_THRESHOLD;

    // Find which pill is currently at the trigger position
    let currentPillAtTrigger = -1;
    for (let i = 0; i < itemCount; i++) {
      const { clampedProgress } = calculatePillProgress(i, scrollProgress, gapRatio, scrollRange);
      const pillPosition = 1 - clampedProgress;

      if (pillPosition >= triggerPosition - threshold && pillPosition <= triggerPosition + threshold) {
        currentPillAtTrigger = i;
        break;
      }
    }

    // Skip first render to avoid playing sound on initial load
    if (!isInitialized.current) {
      isInitialized.current = true;
      lastPillAtTrigger.current = currentPillAtTrigger;
      return;
    }

    // Play sound when a different pill reaches the trigger position
    if (currentPillAtTrigger !== -1 && currentPillAtTrigger !== lastPillAtTrigger.current) {
      play();
      lastPillAtTrigger.current = currentPillAtTrigger;
    }
  }, [scrollProgress, gapRatio, scrollRange, itemCount, play]);
}
