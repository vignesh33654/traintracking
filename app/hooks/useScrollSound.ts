"use client";

import { useEffect, useRef } from 'react';
import { useSound } from './useSound';
import { useIsMobile } from './useIsMobile';
import { useAudioStore } from '../stores/useAudioStore';
import { AUDIO_CONFIG, SOUND_PATHS } from '../config/audio.config';
import { calculatePillProgress } from '../utils/train-scroll-calculator';

interface UseScrollSoundParams {
  scrollProgress: number;
  gapRatio: number;
  scrollRange: number;
  itemCount: number;
}

/**
 * Calculate the pill index at a given target position using direct math.
 * This is O(1) instead of O(N) loop
 */
function findPillAtPosition(
  targetPosition: number,
  threshold: number,
  scrollProgress: number,
  gapRatio: number,
  scrollRange: number,
  itemCount: number
): number {
  if (gapRatio === 0 || itemCount === 0) return -1;

  const targetProgress = 1 - targetPosition;

  // Calculate the approximate pill index
  const offset = scrollProgress * scrollRange;
  const approximateIndex = (targetProgress - offset) / gapRatio;
  const centerIndex = Math.round(approximateIndex);

  // Check the center and adjacent pills (handles threshold)
  for (let delta = 0; delta <= 2; delta++) {
    for (const sign of [0, 1, -1]) {
      const index = centerIndex + sign * delta;
      if (index < 0 || index >= itemCount) continue;

      const { clampedProgress } = calculatePillProgress(index, scrollProgress, gapRatio, scrollRange);
      const pillPosition = 1 - clampedProgress;

      if (pillPosition >= targetPosition - threshold && pillPosition <= targetPosition + threshold) {
        return index;
      }
    }
  }

  return -1;
}

export function useScrollSound({ scrollProgress, gapRatio, scrollRange, itemCount }: UseScrollSoundParams) {
  const lastPillAtTrigger = useRef<number>(-1);
  const isInitialized = useRef(false);
  const isMobile = useIsMobile();
  const setIsMobileDevice = useAudioStore((state) => state.setIsMobileDevice);

  const { play } = useSound(SOUND_PATHS.SCROLL);

  // Update audio store with mobile state
  useEffect(() => {
    setIsMobileDevice(isMobile);
  }, [isMobile, setIsMobileDevice]);

  useEffect(() => {
    if (itemCount === 0) return;

    const triggerPosition = AUDIO_CONFIG.PILL_TRIGGER_POSITION;
    const threshold = AUDIO_CONFIG.TRIGGER_THRESHOLD;

    // Find which pill is at trigger position - O(1) instead of O(N)
    const currentPillAtTrigger = findPillAtPosition(
      triggerPosition,
      threshold,
      scrollProgress,
      gapRatio,
      scrollRange,
      itemCount
    );

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
