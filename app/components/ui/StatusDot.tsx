import { cn } from "@/app/utils/utils";
import { isToday } from "@/app/utils/todaydate";

export interface StatusDotProps {
  journeyDate?: string | null;
  distanceFromOriginKm?: number | null;
  size?: "sm" | "md";
  className?: string;
}

function getStatusColor(
  journeyDate?: string | null,
  distanceFromOriginKm?: number | null
): { color: string; animate: boolean } {
  // If no journey date, default to gray
  if (!journeyDate) {
    return { color: "bg-bg-1", animate: false };
  }

  const isTodayDate = isToday(journeyDate);

  // If journey is today
  if (isTodayDate) {
    
    // Train is running (distance > 0) = green with animation
    if (distanceFromOriginKm && distanceFromOriginKm > 0) {
      return { color: "bg-green", animate: true };
    }
    // Train not started (distance = 0) = red
    return { color: "bg-red", animate: false };
  }

  // Future journey = gray
  return { color: "bg-red", animate: false };
}

export function StatusDot({
  journeyDate,
  distanceFromOriginKm,
  size = "sm",
  className,
}: StatusDotProps) {
  const { color, animate } = getStatusColor(journeyDate, distanceFromOriginKm);
  const sizeClass = size === "sm" ? "size-[6px]" : "size-[8px]";

  return (
    <span
      className={cn("relative flex", sizeClass, className)}
      role="status"
      aria-label={`Status: ${journeyDate ? (isToday(journeyDate) ? "today" : "future") : "unknown"}`}
    >
      {animate && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-90",
            color
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex rounded-full border border-white dark:border-bg-[#ffffff]",
          sizeClass,
          color
        )}
      />
    </span>
  );
}
