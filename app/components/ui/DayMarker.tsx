export interface DayMarkerProps {
  dayNumber: number;
  className?: string;
}

export function DayMarker({ dayNumber, className }: DayMarkerProps) {
  return (
    <div
      className={`relative flex items-center justify-center w-12 h-6 bg-bg-0 border border-dashed border-bg-2 rounded-sm ${className ?? ""}`}
    >
      <span className="font-doto-11-bold text-text-primary">
        DAY {dayNumber}
      </span>
    </div>
  );
}
