import { Component, input } from '@angular/core';
import { BookingStatus } from '../models/booking.model';
import { bookingStatusClass, bookingStatusLabel } from '../utils/booking-status.util';

@Component({
  selector: 'app-booking-status-badge',
  standalone: true,
  template: `
    <span class="admin-status-pill inline-flex items-center gap-1.5 border px-2 py-0.5 text-xs font-medium capitalize {{ statusClass() }}">
      @if (showDot()) {
        <span class="h-1.5 w-1.5 shrink-0 rounded-full {{ dotClass() }}"></span>
      }
      {{ label() }}
    </span>
  `
})
export class BookingStatusBadgeComponent {
  readonly status = input.required<BookingStatus>();
  readonly showDot = input(false);

  statusClass = () => bookingStatusClass(this.status());
  dotClass = () => {
    const map: Record<BookingStatus, string> = {
      pending: 'bg-amber-500',
      confirmed: 'bg-blue-500',
      assigned: 'bg-violet-500',
      'in-progress': 'bg-[var(--accent)]',
      completed: 'bg-emerald-500',
      cancelled: 'bg-zinc-400'
    };
    return map[this.status()];
  };
  label = () => bookingStatusLabel(this.status());
}
