export function getTodayDate(): string {
  const today = new Date();
  return today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');
}

export function isToday(dateString: string): boolean {
  const todayStr = getTodayDate();
  const journeyDateStr = dateString.split('T')[0];

  return todayStr === journeyDateStr;
}

