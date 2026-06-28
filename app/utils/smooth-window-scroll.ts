let activeAnimationFrame: number | null = null;

function easeInOutCubic(progress: number): number {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function smoothWindowScrollTo(top: number, durationMs = 900): void {
  cancelSmoothWindowScroll();

  const startTop = window.scrollY || window.pageYOffset;
  const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const targetTop = Math.max(0, Math.min(top, maxTop));
  const distance = targetTop - startTop;

  if (Math.abs(distance) < 1) {
    window.scrollTo(0, targetTop);
    return;
  }

  const startedAt = performance.now();

  const step = (now: number) => {
    const elapsed = now - startedAt;
    const progress = Math.min(1, elapsed / durationMs);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, startTop + distance * easedProgress);

    if (progress < 1) {
      activeAnimationFrame = requestAnimationFrame(step);
      return;
    }

    activeAnimationFrame = null;
    window.scrollTo(0, targetTop);
  };

  activeAnimationFrame = requestAnimationFrame(step);
}

export function cancelSmoothWindowScroll(): void {
  if (activeAnimationFrame === null) return;

  cancelAnimationFrame(activeAnimationFrame);
  activeAnimationFrame = null;
}
