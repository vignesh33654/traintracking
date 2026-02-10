"use client";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4 2L8 6L12 2"
        stroke="var(--color-text-secondary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 8L8 12L12 8"
        stroke="var(--color-text-secondary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface ScrollDownIndicatorProps {
  scrollProgress: number;
}

export default function ScrollDownIndicator({
  scrollProgress,
}: ScrollDownIndicatorProps) {
  const isVisible = scrollProgress < 0.95;

  return (
    <button
      onClick={() =>
        window.scrollBy({ top: window.innerHeight, behavior: "smooth" })
      }
      className={`md:hidden fixed right-6 bottom-[80px] z-50 w-10 h-10 flex items-center justify-center rounded-full bg-bg-0 border border-divider ${
        isVisible ? "scale-100" : "scale-0 "
      }`}
      aria-label="Scroll down to see more stations"
    >
      <ChevronDownIcon className="animate-chevron-bounce" />
    </button>
  );
}
