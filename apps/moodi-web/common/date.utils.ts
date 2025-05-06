export function parseDate(isoString: string): Date {
  return new Date(isoString);
}

export function convertUtcToLocal(
  dateUtc: Date,
  timezoneOffsetMinutes: number
): Date {
  return new Date(dateUtc.getTime() + timezoneOffsetMinutes * 60000);
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isConsecutiveDay(date1: Date, date2: Date): boolean {
  date2.setDate(date2.getDate() - 1);
  return isSameDay(date1, date2);
}
