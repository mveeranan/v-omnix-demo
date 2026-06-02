export enum DayOfWeekNumber {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 7
}

/** Maps a JS Date to API day numbers (Monday = 1 … Sunday = 7). */
export function dateToDayOfWeekNumber(date: Date): DayOfWeekNumber {
  const jsDay = date.getDay();
  return (jsDay === 0 ? DayOfWeekNumber.Sunday : jsDay) as DayOfWeekNumber;
}

export function dayOfWeekNumberFromIsoDate(isoDate: string): DayOfWeekNumber | null {
  const trimmed = isoDate.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }
  const [year, month, day] = trimmed.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return dateToDayOfWeekNumber(date);
}
