import { PaymentStatus } from '../models/booking.model';

export function paymentStatusClass(status: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    paid: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-300',
    pending:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-300',
    partial:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/35 dark:bg-sky-500/15 dark:text-sky-300',
    refunded:
      'border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-[var(--text-muted)]'
  };
  return map[status];
}

export function paymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    paid: 'Paid',
    pending: 'Pending',
    partial: 'Partial',
    refunded: 'Refunded'
  };
  return labels[status];
}
