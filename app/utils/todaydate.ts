/**
 * Returns today's date in YYYY-MM-DD format.
 * Uses local timezone.
 * @returns Date string formatted as "YYYY-MM-DD"
 * @example getTodayDate() // "2026-01-28"
 */
export function getTodayDate(): string {
  const today = new Date();
  return (
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0")
  );
}

/**
 * Checks if a given date string represents today's date.
 * Compares only the date portion (ignores time/timezone in input).
 * @param dateString - Date string (can be ISO format with time, e.g., "2026-01-28T10:30:00Z")
 * @returns true if the date portion matches today's date
 * @example isToday("2026-01-28T15:30:00Z") // true (if today is Jan 28, 2026)
 */
export function isToday(dateString: string): boolean {
  const todayStr = getTodayDate();
  const journeyDateStr = dateString.split("T")[0];

  return todayStr === journeyDateStr;
}
