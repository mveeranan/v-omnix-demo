import { Component, input, output } from '@angular/core';
import { LucideAngularModule, CalendarX, SearchX, Inbox } from 'lucide-angular';

export type BookingEmptyVariant = 'no-bookings' | 'no-results' | 'no-events';

@Component({
  selector: 'app-booking-empty-state',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <section class="admin-glass-card admin-bookings-empty flex flex-col items-center rounded-xl px-6 py-12 text-center">
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-300">
        <lucide-icon [img]="icon()" class="h-6 w-6" />
      </div>
      <h2 class="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{{ title() }}</h2>
      <p class="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">{{ description() }}</p>
      @if (actionLabel()) {
        <button
          type="button"
          class="admin-bookings-primary-btn mt-6"
          (click)="actionClick.emit()">
          {{ actionLabel() }}
        </button>
      }
    </section>
  `
})
export class BookingEmptyStateComponent {
  readonly variant = input<BookingEmptyVariant>('no-bookings');
  readonly actionLabel = input<string | null>(null);
  readonly actionClick = output<void>();

  icon = () => {
    const v = this.variant();
    if (v === 'no-results') return SearchX;
    if (v === 'no-events') return CalendarX;
    return Inbox;
  };

  title = () => {
    const v = this.variant();
    if (v === 'no-results') return 'No matching bookings';
    if (v === 'no-events') return 'No events in this period';
    return 'No bookings yet';
  };

  description = () => {
    const v = this.variant();
    if (v === 'no-results') return 'Try adjusting your search or filters to find what you are looking for.';
    if (v === 'no-events') return 'There are no bookings scheduled for the selected date range and filters.';
    return 'Create your first booking to start managing appointments and schedules.';
  };
}
