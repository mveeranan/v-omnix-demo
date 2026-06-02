import { Component, input } from '@angular/core';
import { BookingStats } from '../models/booking.model';

@Component({
  selector: 'app-booking-stat-cards',
  standalone: true,
  template: `
    <div class="admin-bookings-stats grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      @for (card of cards(); track card.key) {
        <article class="admin-glass-card admin-bookings-stats__card rounded-xl p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {{ card.label }}
          </p>
          <p class="admin-bookings-stats__value mt-1 text-2xl font-semibold" [class]="card.colorClass">
            {{ card.value }}
          </p>
        </article>
      }
    </div>
  `
})
export class BookingStatCardsComponent {
  readonly stats = input.required<BookingStats>();

  cards = () => {
    const s = this.stats();
    return [
      { key: 'total', label: 'Total Bookings', value: s.total, colorClass: 'text-zinc-900 dark:text-zinc-50' },
      { key: 'pending', label: 'Pending', value: s.pending, colorClass: 'text-amber-600 dark:text-amber-400' },
      { key: 'confirmed', label: 'Confirmed', value: s.confirmed, colorClass: 'text-blue-600 dark:text-blue-400' },
      { key: 'inProgress', label: 'In Progress', value: s.inProgress, colorClass: 'text-indigo-600 dark:text-indigo-400' },
      { key: 'completed', label: 'Completed', value: s.completed, colorClass: 'text-emerald-600 dark:text-emerald-400' },
      { key: 'cancelled', label: 'Cancelled', value: s.cancelled, colorClass: 'text-zinc-500 dark:text-zinc-400' }
    ];
  };
}
