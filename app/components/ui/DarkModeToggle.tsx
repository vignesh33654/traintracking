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
      <path
        d="M10 3V1M10 19V17M17 10H19M1 10H3M15.657 4.343L17.071 2.929M2.929 17.071L4.343 15.657M15.657 15.657L17.071 17.071M2.929 2.929L4.343 4.343M14 10C14 12.2091 12.2091 14 10 14C7.79086 14 6 12.2091 6 10C6 7.79086 7.79086 6 10 6C12.2091 6 14 7.79086 14 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
        d="M17 10.5C16.8 14.9 13.2 18.5 8.8 18.5C5.1 18.5 2 15.8 1.5 12.3C1.4 11.6 2 11 2.7 11.1C3.2 11.2 3.7 11.2 4.3 11.2C8.7 11.2 12.3 7.6 12.3 3.2C12.3 2.6 12.2 2.1 12.1 1.6C12 0.9 12.6 0.3 13.3 0.4C16.3 1 18.5 3.6 18.5 6.7C18.5 8 18.1 9.3 17 10.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function DarkModeToggle() {
  const { isDark, toggleDarkMode } = useDark();

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg bg-bg-1 px-4 py-2 text-text-primary transition-colors duration-200 hover:bg-bg-2 focus-ring"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      <span className="text-sm font-medium">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
