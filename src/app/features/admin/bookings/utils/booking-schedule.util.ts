import { BranchDto, BranchWorkingDayDto, WORKING_DAY_LABELS } from '../../models/branch.model';
import { dayOfWeekNumberFromIsoDate } from '../models/day-of-week.model';

export interface BookingScheduleValidation {
  valid: boolean;
  message?: string;
}

export function timeSpanToMinutes(value?: string | null): number | null {
  if (!value?.trim()) {
    return null;
  }
  const parts = value.trim().split(':');
  if (parts.length < 2) {
    return null;
  }
  const hours = Number.parseInt(parts[0], 10);
  const minutes = Number.parseInt(parts[1], 10);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }
  return hours * 60 + minutes;
}

export function minutesToTimeInput(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(totalMinutes, 23 * 60 + 59));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function formatMinutes12h(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hour12 = hours24 % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

export function getWorkingDayForDate(
  branch: BranchDto | null | undefined,
  isoDate: string
): BranchWorkingDayDto | undefined {
  const dayNumber = dayOfWeekNumberFromIsoDate(isoDate);
  if (!dayNumber || !branch?.workingDays?.length) {
    return undefined;
  }
  return branch.workingDays.find((d) => d.dayNumber === dayNumber);
}

export function isDateBookable(branch: BranchDto | null | undefined, isoDate: string): boolean {
  const workingDay = getWorkingDayForDate(branch, isoDate);
  if (!workingDay || workingDay.isDayOff) {
    return false;
  }
  const open = timeSpanToMinutes(workingDay.startTime);
  const close = timeSpanToMinutes(workingDay.endTime);
  return open !== null && close !== null && open < close;
}

export function isIsoDateInPast(isoDate: string): boolean {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

export function getLatestStartMinutes(
  workingDay: BranchWorkingDayDto,
  durationMinutes: number
): number | null {
  const close = timeSpanToMinutes(workingDay.endTime);
  if (close === null) {
    return null;
  }
  const duration = Math.max(0, durationMinutes);
  return Math.max(0, close - duration);
}

export function getScheduleTimeBounds(
  workingDay: BranchWorkingDayDto | undefined,
  durationMinutes: number
): { min: string; max: string } | null {
  if (!workingDay || workingDay.isDayOff) {
    return null;
  }
  const open = timeSpanToMinutes(workingDay.startTime);
  const latestStart = getLatestStartMinutes(workingDay, durationMinutes);
  if (open === null || latestStart === null || latestStart < open) {
    return null;
  }
  return {
    min: minutesToTimeInput(open),
    max: minutesToTimeInput(latestStart)
  };
}

export function validateBookingSchedule(
  workingDay: BranchWorkingDayDto | undefined,
  startTime: string,
  durationMinutes: number
): BookingScheduleValidation {
  if (!workingDay) {
    return { valid: false, message: 'Select a date when the branch is open.' };
  }

  if (workingDay.isDayOff) {
    const label = WORKING_DAY_LABELS[workingDay.dayNumber] ?? 'This day';
    return { valid: false, message: `${label} is closed at the selected branch.` };
  }

  const trimmedStart = startTime.trim();
  if (!trimmedStart) {
    return { valid: false, message: 'Select a start time for the booking.' };
  }

  const startMinutes = timeSpanToMinutes(trimmedStart);
  const openMinutes = timeSpanToMinutes(workingDay.startTime);
  const closeMinutes = timeSpanToMinutes(workingDay.endTime);

  if (startMinutes === null || openMinutes === null || closeMinutes === null) {
    return { valid: false, message: 'Branch hours are not configured for this day.' };
  }

  const duration = Math.max(0, durationMinutes);
  const endMinutes = startMinutes + duration;
  const latestStart = closeMinutes - duration;

  if (startMinutes < openMinutes) {
    return {
      valid: false,
      message: `Select a time after opening (${formatMinutes12h(openMinutes)}).`
    };
  }

  if (duration > 0 && startMinutes > latestStart) {
    return {
      valid: false,
      message: `For a ${duration}-minute service, select a start time before ${formatMinutes12h(latestStart)} (branch closes at ${formatMinutes12h(closeMinutes)}).`
    };
  }

  if (endMinutes > closeMinutes) {
    return {
      valid: false,
      message: `This booking would end after closing (${formatMinutes12h(closeMinutes)}). Choose an earlier start time.`
    };
  }

  return { valid: true };
}

export interface LocalScheduledRange {
  startLocal: Date;
  endLocal: Date;
  endTimeInput: string;
}

export function buildLocalScheduledRange(
  isoDate: string,
  startTime: string,
  durationMinutes: number
): LocalScheduledRange | null {
  const trimmedDate = isoDate.trim();
  const trimmedStart = startTime.trim();
  if (!trimmedDate || !trimmedStart) {
    return null;
  }

  const dateParts = trimmedDate.split('-').map(Number);
  const timeParts = trimmedStart.split(':').map(Number);
  if (dateParts.length < 3 || timeParts.length < 2) {
    return null;
  }

  const [year, month, day] = dateParts;
  const [hours, minutes] = timeParts;
  if (![year, month, day, hours, minutes].every((n) => Number.isFinite(n))) {
    return null;
  }

  const startLocal = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (Number.isNaN(startLocal.getTime())) {
    return null;
  }

  const duration = Math.max(0, durationMinutes);
  const endLocal = new Date(startLocal.getTime() + duration * 60_000);
  const endMinutes =
    endLocal.getHours() * 60 + endLocal.getMinutes();
  return {
    startLocal,
    endLocal,
    endTimeInput: minutesToTimeInput(endMinutes)
  };
}

export function toUtcIsoString(date: Date): string {
  return date.toISOString();
}

export function formatLocalDateTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

export function formatUtcDateTime(isoUtc: string): string {
  const date = new Date(isoUtc);
  if (Number.isNaN(date.getTime())) {
    return isoUtc;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC'
  }).format(date);
}

export function formatWorkingDayHoursHint(
  workingDay: BranchWorkingDayDto | undefined,
  durationMinutes: number
): string {
  if (!workingDay || workingDay.isDayOff) {
    return 'Select an open day to see available hours.';
  }
  const open = timeSpanToMinutes(workingDay.startTime);
  const close = timeSpanToMinutes(workingDay.endTime);
  if (open === null || close === null) {
    return 'Branch hours are not set for this day.';
  }
  const latestStart = getLatestStartMinutes(workingDay, durationMinutes);
  let hint = `Hours: ${formatMinutes12h(open)} – ${formatMinutes12h(close)}`;
  if (durationMinutes > 0 && latestStart !== null && latestStart >= open) {
    hint += ` · Latest start for ${durationMinutes} min: ${formatMinutes12h(latestStart)}`;
  }
  return hint;
}
