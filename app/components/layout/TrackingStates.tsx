"use client";

interface TrackingErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function TrackingLoadingState() {
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg text-text-primary">Loading...</p>
    </div>
  );
}

export function TrackingEmptyState() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3">
      <p className="text-lg text-text-primary">No train data yet</p>
      <p className="text-sm text-text-secondary">Check back in a moment.</p>
    </div>
  );
}

export function TrackingErrorState({ message, onRetry }: TrackingErrorStateProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <p className="text-lg text-text-primary">Error loading train data</p>
      <p className="text-sm text-text-secondary">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-bg-1 px-4 py-2 text-text-primary transition-colors hover:bg-bg-2"
        aria-label="Retry loading train data"
      >
        Try again
      </button>
    </div>
  );
}
