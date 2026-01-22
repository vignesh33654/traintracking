"use client";

import { useRef, useEffect, useCallback } from 'react';
import { useAudioStore } from '../stores/useAudioStore';
import { AUDIO_CONFIG } from '../config/audio.config';

const { POOL_SIZE } = AUDIO_CONFIG;

export function useSound(src: string) {
  const audioPoolRef = useRef<HTMLAudioElement[]>([]);
  const poolIndexRef = useRef(0);
  const isReadyRef = useRef(false);
  const { getEffectiveVolume, initializeFromStorage } = useAudioStore();

  useEffect(() => {
    initializeFromStorage();

    const pool: HTMLAudioElement[] = [];
    let readyCount = 0;

    for (let i = 0; i < POOL_SIZE; i++) {
      const audio = new Audio(src);
      audio.preload = 'auto';

      audio.addEventListener('canplaythrough', () => {
        readyCount++;
        if (readyCount === POOL_SIZE) {
          isReadyRef.current = true;
        }
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio load error:', src, e);
      });

      pool.push(audio);
    }

    audioPoolRef.current = pool;

    return () => {
      pool.forEach((audio) => {
        audio.pause();
      });
      audioPoolRef.current = [];
      isReadyRef.current = false;
    };
  }, [src, initializeFromStorage]);

  const play = useCallback(() => {
    if (!isReadyRef.current || audioPoolRef.current.length === 0) return;

    const volume = getEffectiveVolume();
    if (volume === 0) return;

    const audio = audioPoolRef.current[poolIndexRef.current];
    poolIndexRef.current = (poolIndexRef.current + 1) % POOL_SIZE;

    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch((e) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Audio play failed:', e.message);
      }
    });
  }, [getEffectiveVolume]);

  const stop = useCallback(() => {
    audioPoolRef.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  return { play, stop };
}
