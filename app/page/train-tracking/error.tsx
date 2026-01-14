"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <p className="text-text-primary text-lg">Error loading train data</p>
      <p className="text-text-secondary text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-bg-1 px-4 py-2 text-text-primary transition-colors hover:bg-bg-2"
      >
        Try again
      </button>
    </div>
  );
}

