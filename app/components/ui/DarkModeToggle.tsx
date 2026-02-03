"use client";

import { useDark } from "../../hooks/useDark";

function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g clipPath="url(#clip0_light_mode)">
        <path
          d="M9.99998 14.1666C12.3012 14.1666 14.1666 12.3012 14.1666 9.99998C14.1666 7.69879 12.3012 5.83331 9.99998 5.83331C7.69879 5.83331 5.83331 7.69879 5.83331 9.99998C5.83331 12.3012 7.69879 14.1666 9.99998 14.1666Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.99998 0.833313V2.49998M9.99998 17.5V19.1666M3.51665 3.51665L4.69998 4.69998M15.3 15.3L16.4833 16.4833M0.833313 9.99998H2.49998M17.5 9.99998H19.1666M3.51665 16.4833L4.69998 15.3M15.3 4.69998L16.4833 3.51665"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_light_mode">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.5 10.6583C17.3689 12.0768 16.8365 13.4287 15.9652 14.5557C15.0938 15.6826 13.9196 16.5382 12.5797 17.0221C11.2399 17.5061 9.78997 17.5984 8.39956 17.2884C7.00916 16.9784 5.73581 16.2788 4.7285 15.2715C3.72119 14.2642 3.0216 12.9908 2.71157 11.6004C2.40154 10.21 2.49391 8.76007 2.97786 7.42025C3.46182 6.08042 4.31734 4.90614 5.44432 4.03479C6.57131 3.16345 7.92314 2.63109 9.34165 2.5C8.51116 3.62356 8.11152 5.00787 8.21542 6.40118C8.31932 7.79448 8.91986 9.10422 9.90781 10.0922C10.8958 11.0801 12.2055 11.6807 13.5988 11.7846C14.9921 11.8885 16.3764 11.4888 17.5 10.6583Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface DarkModeToggleProps {
  variant?: "fixed" | "inline";
}

export default function DarkModeToggle({ variant = "fixed" }: DarkModeToggleProps) {
  const { isDark, toggleDarkMode } = useDark();

  const baseClasses = "hover:cursor-pointer flex rounded-full border border-divider bg-bg-0 p-1 text-text-primary focus-ring";
  const variantClasses = variant === "fixed"
    ? "fixed top-4 right-4 z-50 max-md:hidden"
    : "shrink-0";

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`${baseClasses} ${variantClasses}`}
    >
      <span
        className={`flex items-center justify-center rounded-full transition-colors ${variant === "inline" ? "size-[30px]" : "size-9"} ${isDark ? "bg-bg-1 " : "bg-transparent"}`}
        aria-hidden
      >
        <MoonIcon />
      </span>
      <span
        className={`flex items-center justify-center rounded-full transition-colors ${variant === "inline" ? "size-[30px]" : "size-9"} ${!isDark ? "bg-bg-1" : "bg-transparent"}`}
        aria-hidden
      >
        <SunIcon />
      </span>
    </button>
  );
}
