import { cn } from "@/app/utils/utils";

export interface StatusDotProps {
  journeyDate?: string | null;
  distanceFromOriginKm?: number | null;
  size?: "sm" | "md";
  className?: string;
}

function isToday(dateString: string): boolean {
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayStr = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');

  // Compare just the date part (YYYY-MM-DD)
  const journeyDateStr = dateString.split('T')[0]; // Remove time part if present

  return todayStr === journeyDateStr;
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
  return { color: "bg-bg-1", animate: false };
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
    <div
      className={cn(
        "rounded-full",
        sizeClass,
        color,
        animate && "animate-pulse-scale",
        className
      )}
      role="status"
      aria-label={`Status: ${journeyDate ? (isToday(journeyDate) ? "today" : "future") : "unknown"}`}
    />
  );
}
