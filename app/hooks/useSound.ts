"use client";

import { useRef, useEffect, useCallback } from 'react';
import { useAudioStore } from '../stores/useAudioStore';
import { AUDIO_CONFIG } from '../config/audio.config';

const POOL_SIZE: number = AUDIO_CONFIG.POOL_SIZE;

export function useSound(src: string, poolSize = POOL_SIZE) {
  const audioPoolRef = useRef<HTMLAudioElement[]>([]);
  const poolIndexRef = useRef(0);
  const isReadyRef = useRef(false);
  const { getEffectiveVolume, initializeFromStorage } = useAudioStore();

  useEffect(() => {
    initializeFromStorage();

    const pool: HTMLAudioElement[] = [];
    let readyCount = 0;

    for (let i = 0; i < poolSize; i++) {
      const audio = new Audio(src);
      audio.preload = 'auto';

      audio.addEventListener('canplaythrough', () => {
        readyCount++;
        if (readyCount === poolSize) {
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
  }, [src, initializeFromStorage, poolSize]);

  const play = useCallback(() => {
    if (!isReadyRef.current || audioPoolRef.current.length === 0) return;

    const volume = getEffectiveVolume();
    if (volume === 0) return;

    const audio = audioPoolRef.current[poolIndexRef.current];
    poolIndexRef.current = (poolIndexRef.current + 1) % poolSize;

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
