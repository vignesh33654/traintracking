"use client";

export default function EmptyState() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3">
      <p className="text-lg text-text-primary">No train data yet</p>
      <p className="text-sm text-text-secondary">Check back in a moment.</p>
    </div>
  );
}
