"use client";

import { useEffect, useRef } from 'react';
import { useSound } from './useSound';
import { AUDIO_CONFIG, SOUND_PATHS } from '../config/audio.config';

export function useScrollSound() {
  const isScrolling = useRef(false);
  const isLooping = useRef(false);
  const scrollStartTime = useRef<number>(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const { play: playInitial, stop: stopInitial } = useSound(SOUND_PATHS.SCROLL);
  const { play: playLoop, stop: stopLoop } = useSound(SOUND_PATHS.SCROLL_LOOP);

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();

      if (!isScrolling.current) {
        // Single scroll - play initial sound once
        isScrolling.current = true;
        scrollStartTime.current = now;
        playInitial();
      } else if (!isLooping.current && (now - scrollStartTime.current > AUDIO_CONFIG.LOOP_THRESHOLD_MS)) {
        // Continuous scrolling detected - switch to loop sound
        isLooping.current = true;
        stopInitial();
        playLoop({ loop: true });
      }

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        // Scroll ended
        isScrolling.current = false;
        
        if (isLooping.current) {
          stopLoop();
          isLooping.current = false;
        }
      }, AUDIO_CONFIG.SCROLL_DEBOUNCE_MS);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      stopInitial();
      stopLoop();
    };
  }, [playInitial, stopInitial, playLoop, stopLoop]);
}
