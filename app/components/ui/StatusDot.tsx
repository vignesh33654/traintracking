import { cn } from "@/app/utils/utils";
import { isToday } from "@/app/utils/todaydate";
import type { RouteStation } from "@/app/types/train.types";

export interface StatusDotProps {
  journeyDate?: string | null;
  distanceFromOriginKm?: number | null;
  currentStationCode?: string | null;
  currentSequence?: number | null;
  route?: RouteStation[];
  size?: "sm" | "md";
  className?: string;
}

function hasJourneyStarted(
  distanceFromOriginKm?: number | null,
  currentStationCode?: string | null,
  currentSequence?: number | null,
  route?: RouteStation[]
): boolean {
  if (distanceFromOriginKm != null && distanceFromOriginKm > 0) return true;
  if (!route || route.length === 0) return false;

  const firstStation = route[0];
  if (currentSequence != null && currentSequence > firstStation.sequence) {
    return true;
  }

  return Boolean(
    currentStationCode && currentStationCode !== firstStation.stationCode
  );
}

function getStatusColor(
  journeyDate?: string | null,
  distanceFromOriginKm?: number | null,
  currentStationCode?: string | null,
  currentSequence?: number | null,
  route?: RouteStation[]
): { color: string; animate: boolean } {
  // If no journey date, default to gray
  if (!journeyDate) {
    return { color: "bg-bg-1", animate: false };
  }

  const isTodayDate = isToday(journeyDate);

  // If journey is today
  if (isTodayDate) {
    // Train is running = green with animation
    if (
      hasJourneyStarted(
        distanceFromOriginKm,
        currentStationCode,
        currentSequence,
        route
      )
    ) {
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
  currentStationCode,
  currentSequence,
  route,
  size = "sm",
  className,
}: StatusDotProps) {
  const { color, animate } = getStatusColor(
    journeyDate,
    distanceFromOriginKm,
    currentStationCode,
    currentSequence,
    route
  );
  const sizeClass = size === "sm" ? "size-1.5" : "size-2";

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
          "relative inline-flex rounded-full border border-white dark:border-white",
          sizeClass,
          color
        )}
      />
    </span>
  );
}
