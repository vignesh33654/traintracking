import { useEffect, useState, RefObject } from 'react';

export function useNativeScroll(ref: RefObject<HTMLElement | null>): number {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        if (!ref.current) {
          setScrollProgress(0);
          return;
        }

        const element = ref.current;
        const rect = element.getBoundingClientRect();
        const elementHeight = element.offsetHeight;
        const viewportHeight = window.innerHeight;

        // Calculate scroll progress: 0 when element starts entering viewport, 1 when element finishes leaving
        const scrollableDistance = elementHeight - viewportHeight;
        
        if (scrollableDistance <= 0) {
          setScrollProgress(0);
          return;
        }

        // Progress from 0 (top of element at top of viewport) to 1 (bottom of element at bottom of viewport)
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));
        
        setScrollProgress(progress);
      });
    };

    // Initial calculation
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [ref]);

  return scrollProgress;
}

