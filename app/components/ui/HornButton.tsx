"use client";

import { useSound } from "@/app/hooks/useSound";
import { SOUND_PATHS } from "@/app/config/audio.config";

function HornIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M9.1487 11.7495L10.882 16.9995H7.41536L5.68203 11.7495H9.1487ZM9.1487 11.7495V7.37451M10.0154 7.37451C8.61312 7.37451 6.70671 7.37451 5.24782 7.37451C4.0512 7.37451 3.08203 8.35389 3.08203 9.56201C3.08203 10.7701 4.0512 11.7495 5.24782 11.7495C6.70671 11.7495 8.61312 11.7495 10.0154 11.7495C12.6154 11.7495 16.082 16.1245 16.082 16.1245V2.99951C16.082 2.99951 12.6154 7.37451 10.0154 7.37451Z"
        stroke="#5D5D5D"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HornButton() {
  const { play } = useSound(SOUND_PATHS.HORN);

  const handleClick = () => {
    play();
    window.dispatchEvent(new CustomEvent("horn-honk"));
  };

  return (
    <button
      onClick={handleClick}
      className="hover:cursor-pointer fixed left-4 md:left-auto md:right-4 bottom-4 md:bottom-18 w-14 h-14 md:w-10 md:h-10 z-50 flex flex-col justify-center items-center rounded-full bg-bg-0 border border-divider text-text-primary transition-none hover:bg-bg-1 focus-ring"
      aria-label="Play horn sound"
    >
      <HornIcon />
    </button>
  );
}
