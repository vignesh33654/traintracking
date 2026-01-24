export function isToday(dateString: string): boolean {
  const today = new Date();
  const todayStr = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');

  const journeyDateStr = dateString.split('T')[0];

  return todayStr === journeyDateStr;
}

