import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { LucideAngularModule, Check, Circle, X } from 'lucide-angular';
import { TimelineEvent } from '../models/booking.model';

@Component({
  selector: 'app-booking-timeline',
  standalone: true,
  imports: [DatePipe, LucideAngularModule],
  template: `
    <div class="admin-glass-card admin-bookings-timeline rounded-xl p-5">
      <h3 class="admin-widget__title mb-4">Booking Timeline</h3>
      <ol class="admin-bookings-timeline__list">
        @for (event of events(); track event.key; let last = $last) {
          <li class="admin-bookings-timeline__item" [class.admin-bookings-timeline__item--last]="last">
            <div
              class="admin-bookings-timeline__marker"
              [class.admin-bookings-timeline__marker--done]="event.completed"
              [class.admin-bookings-timeline__marker--active]="event.active"
              [class.admin-bookings-timeline__marker--cancelled]="event.key === 'cancelled'">
              @if (event.key === 'cancelled') {
                <lucide-icon [img]="xIcon" class="h-3.5 w-3.5" />
              } @else if (event.completed) {
                <lucide-icon [img]="checkIcon" class="h-3.5 w-3.5" />
              } @else {
                <lucide-icon [img]="circleIcon" class="h-3.5 w-3.5" />
              }
            </div>
            <div class="admin-bookings-timeline__content admin-glass-card rounded-lg p-3">
              <p class="text-sm font-medium text-zinc-900 dark:text-zinc-50">{{ event.label }}</p>
              @if (event.timestamp) {
                <p class="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {{ event.timestamp | date: 'MMM d, y · h:mm a' }}
                </p>
              } @else if (!event.completed) {
                <p class="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Pending</p>
              }
            </div>
          </li>
        }
      </ol>
    </div>
  `
})
export class BookingTimelineComponent {
  readonly events = input.required<TimelineEvent[]>();

  readonly checkIcon = Check;
  readonly circleIcon = Circle;
  readonly xIcon = X;
}
