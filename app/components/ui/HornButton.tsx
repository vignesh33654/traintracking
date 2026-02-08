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
        d="M3 8V12H5.5L9 15V5L5.5 8H3Z"
        fill="white"
      />
      <path
        d="M12.5 10C12.5 8.62 11.72 7.44 10.6 6.87V13.12C11.72 12.56 12.5 11.38 12.5 10Z"
        fill="white"
      />
      <path
        d="M10.6 3.02V4.07C12.89 4.72 14.5 6.82 14.5 9.3C14.5 11.78 12.89 13.88 10.6 14.53V15.58C13.45 14.89 15.5 12.34 15.5 9.3C15.5 6.26 13.45 3.71 10.6 3.02Z"
        fill="white"
      />
    </svg>
  );
}

export default function HornButton() {
  const { play } = useSound(SOUND_PATHS.HORN);

  return (
    <button
      onClick={play}
      className="hover:cursor-pointer fixed right-4 bottom-[72px] w-10 h-10 z-50 flex flex-col justify-center items-center rounded-full bg-[#808080] text-text-primary transition-none hover:bg-[#6b6b6b] focus-ring"
      aria-label="Play horn sound"
    >
      <HornIcon />
    </button>
  );
}
