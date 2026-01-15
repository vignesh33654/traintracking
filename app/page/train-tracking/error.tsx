"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <p className="text-lg text-text-primary">Error loading train data</p>
      <p className="text-sm text-text-secondary">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-bg-1 px-4 py-2 text-text-primary transition-colors hover:bg-bg-2"
        aria-label="Retry loading train data"
      >
        Try again
      </button>
    </div>
  );
}

