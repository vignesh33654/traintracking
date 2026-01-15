"use client";

import { useRef, useEffect, useCallback } from 'react';
import { useAudioStore } from '../stores/useAudioStore';

interface PlayOptions {
  loop?: boolean;
}

export function useSound(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isReadyRef = useRef(false);
  const { getEffectiveVolume, initializeFromStorage } = useAudioStore();

  useEffect(() => {
    initializeFromStorage();
    
    const audio = new Audio(src);
    audio.preload = 'auto';
    
    const handleCanPlay = () => {
      isReadyRef.current = true;
    };
    
    const handleError = (e: Event) => {
      console.error('Audio load error:', src, e);
    };
    
    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError);
    audioRef.current = audio;

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audioRef.current = null;
      isReadyRef.current = false;
    };
  }, [src, initializeFromStorage]);

  const play = useCallback((options?: PlayOptions) => {
    if (!audioRef.current || !isReadyRef.current) return;
    
    const volume = getEffectiveVolume();
    if (volume === 0) return;

    audioRef.current.volume = volume;
    audioRef.current.loop = options?.loop ?? false;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // Autoplay blocked by browser
    });
  }, [getEffectiveVolume]);

  const stop = useCallback(() => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.loop = false;
  }, []);

  return { play, stop };
}
