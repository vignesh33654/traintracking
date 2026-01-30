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
        d="M15 11C15 11.9889 14.7068 12.9556 14.1574 13.7779C13.6079 14.6001 12.8271 15.241 11.9134 15.6194C10.9998 15.9978 9.99446 16.0969 9.02455 15.9039C8.05465 15.711 7.16373 15.2348 6.46447 14.5355C5.76521 13.8363 5.289 12.9454 5.09608 11.9755C4.90315 11.0055 5.00217 10.0002 5.38061 9.08658C5.75904 8.17295 6.39991 7.39206 7.22215 6.84265C8.0444 6.29324 9.0111 6 10 6H13.0911L11.2989 7.7927L12 8.5L15 5.5L12 2.5L11.2989 3.207L13.0926 5H10C8.81331 5 7.65328 5.35189 6.66658 6.01118C5.67989 6.67047 4.91085 7.60754 4.45673 8.7039C4.0026 9.80026 3.88378 11.0067 4.11529 12.1705C4.3468 13.3344 4.91825 14.4035 5.75736 15.2426C6.59648 16.0818 7.66558 16.6532 8.82946 16.8847C9.99335 17.1162 11.1997 16.9974 12.2961 16.5433C13.3925 16.0892 14.3295 15.3201 14.9888 14.3334C15.6481 13.3467 16 12.1867 16 11H15Z"
        fill="white"
      />
    </svg>
  );
}

export default function RefreshButton({ onRefresh, isRefreshing = false }: RefreshButtonProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className="hover:cursor-pointer fixed right-4 bottom-4 w-10 h-10 z-50 flex flex-col justify-center items-center rounded-full bg-orange  text-text-primary transition-none hover:bg-orange-500 focus-ring disabled:opacity-50 "
      aria-label="Refresh train data"
    >
      <RefreshIcon className={isRefreshing ? "animate-spin" : ""} />
    </button>
  );
}
