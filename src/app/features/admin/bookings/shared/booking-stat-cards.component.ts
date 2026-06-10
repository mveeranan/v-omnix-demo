import { Component, input } from '@angular/core';
import { BookingStats } from '../models/booking.model';

@Component({
  selector: 'app-booking-stat-cards',
  standalone: true,
  template: `
    <div class="admin-bookings-stats grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      @for (card of cards(); track card.key) {
        <article class="app-metric-card admin-bookings-stats__card">
          <p class="app-metric-card__label">
            {{ card.label }}
          </p>
          <p class="app-metric-card__value admin-bookings-stats__value" [class]="card.toneClass">
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
      { key: 'total', label: 'Total Bookings', value: s.total, toneClass: '' },
      { key: 'pending', label: 'Pending', value: s.pending, toneClass: 'text-[var(--warning)]' },
      { key: 'confirmed', label: 'Confirmed', value: s.confirmed, toneClass: 'text-[var(--info)]' },
      { key: 'inProgress', label: 'In Progress', value: s.inProgress, toneClass: 'text-[var(--accent)]' },
      { key: 'completed', label: 'Completed', value: s.completed, toneClass: 'text-[var(--success)]' },
      { key: 'cancelled', label: 'Cancelled', value: s.cancelled, toneClass: 'text-[var(--text-muted)]' }
    ];
  };
}
