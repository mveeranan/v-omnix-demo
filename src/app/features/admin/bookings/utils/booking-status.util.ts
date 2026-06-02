import { BookingStatus } from '../models/booking.model';

export function bookingStatusClass(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    confirmed:
      'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/35 dark:bg-blue-500/15 dark:text-blue-300',
    pending:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-300',
    assigned:
      'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/35 dark:bg-violet-500/15 dark:text-violet-300',
    'in-progress':
      'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/35 dark:bg-indigo-500/15 dark:text-indigo-300',
    completed:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-300',
    cancelled:
      'border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
  };
  return map[status];
}

export function bookingStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    assigned: 'Assigned',
    'in-progress': 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return labels[status];
}

export function bookingStatusDotClass(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    pending: 'bg-amber-500',
    confirmed: 'bg-blue-500',
    assigned: 'bg-violet-500',
    'in-progress': 'bg-indigo-500',
    completed: 'bg-emerald-500',
    cancelled: 'bg-zinc-400'
  };
  return map[status];
}
