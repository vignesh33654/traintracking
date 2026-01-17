// Formats delay time in minutes to human-readable string
export function formatDelay(minutes: number | null | undefined): string {
  if (minutes == null) return 'N/A';
  if (minutes === 0) return 'On Time';
  return minutes > 0 ? `${minutes} min late` : `${Math.abs(minutes)} min early`;
}

// Converts minutes since midnight to HH:MM format
export function formatTime(minutesSinceMidnight: number | null | undefined): string {
  if (minutesSinceMidnight == null) return '--:--';

  const hours = Math.floor(minutesSinceMidnight / 60);
  const minutes = minutesSinceMidnight % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Converts minutes since midnight to 12-hour AM/PM format (e.g., "5:13 AM")
export function formatTimeAmPm(minutesSinceMidnight: number | null | undefined): string {
  if (minutesSinceMidnight == null) return '--:--';

  const totalMinutes = minutesSinceMidnight % (24 * 60);
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;

  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

