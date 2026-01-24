"use client";

interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

function RefreshIcon({ className }: { className?: string }) {
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
        d="M17.5 3.333V8.333H12.5M2.5 16.667V11.667H7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.108 7.5A7.5 7.5 0 0115.642 4.742L17.5 6.667M2.5 13.333L4.358 15.258A7.5 7.5 0 0015.892 12.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RefreshButton({ onRefresh, isRefreshing = false }: RefreshButtonProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-lg bg-bg-1 px-4 py-2 text-text-primary transition-none hover:bg-bg-2 focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Refresh train data"
    >
      <RefreshIcon className={isRefreshing ? "animate-spin" : ""} />
      <span className="text-sm font-medium">Refresh</span>
    </button>
  );
}
