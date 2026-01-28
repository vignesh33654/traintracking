import {
  MS_PER_MINUTE,
  MINUTES_PER_HOUR,
  HOURS_PER_DAY,
} from "@/app/config/circular-rotator.config";

/** Formats delay time in minutes to human-readable string */
export function formatDelay(minutes: number | null | undefined): string {
  if (minutes == null) return "N/A";
  if (minutes === 0) return "On Time";
  return minutes > 0 ? `${minutes} min late` : `${Math.abs(minutes)} min early`;
}

/** Converts minutes since midnight to HH:MM format */
export function formatTime(
  minutesSinceMidnight: number | null | undefined
): string {
  if (minutesSinceMidnight == null) return "--:--";

  const hours = Math.floor(minutesSinceMidnight / MINUTES_PER_HOUR);
  const minutes = minutesSinceMidnight % MINUTES_PER_HOUR;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/** Converts minutes since midnight to 12-hour AM/PM format (e.g., "5:13 AM") */
export function formatTimeAmPm(
  minutesSinceMidnight: number | null | undefined
): string {
  if (minutesSinceMidnight == null) return "--:--";

  const totalMinutes = minutesSinceMidnight % (HOURS_PER_DAY * MINUTES_PER_HOUR);
  const hours24 = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;

  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;

  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/** Formats timestamp to relative time (e.g., "2h 15m AGO") */
export function formatRelativeTime(
  lastUpdatedAt: string | null | undefined
): string {
  if (!lastUpdatedAt) return "JUST NOW";

  const diffMs = Date.now() - new Date(lastUpdatedAt).getTime();
  const diffMinutes = Math.floor(diffMs / MS_PER_MINUTE);

  if (diffMinutes < 1) return "JUST NOW";

  if (diffMinutes < MINUTES_PER_HOUR) {
    return `${diffMinutes}m AGO`;
  }

  const hours = Math.floor(diffMinutes / MINUTES_PER_HOUR);
  const mins = diffMinutes % MINUTES_PER_HOUR;

  if (hours < HOURS_PER_DAY) {
    return mins > 0 ? `${hours}h ${mins}m AGO` : `${hours}h AGO`;
  }

  const days = Math.floor(hours / HOURS_PER_DAY);
  const remainingHours = hours % HOURS_PER_DAY;

  return remainingHours > 0 ? `${days}d ${remainingHours}h AGO` : `${days}d AGO`;
}
