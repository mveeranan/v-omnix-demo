import { Component, input } from '@angular/core';

export type BookingSkeletonVariant = 'stats' | 'table' | 'detail' | 'calendar' | 'wizard';

@Component({
  selector: 'app-booking-skeleton',
  standalone: true,
  template: `
    @switch (variant()) {
      @case ('stats') {
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <div class="admin-glass-card h-24 animate-pulse rounded-xl"></div>
          }
        </div>
      }
      @case ('table') {
        <div class="admin-glass-card overflow-hidden rounded-xl p-4">
          <div class="admin-skeleton mb-4 h-10 w-full max-w-md"></div>
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <div class="admin-skeleton mb-2 h-12 w-full"></div>
          }
        </div>
      }
      @case ('detail') {
        <div class="grid gap-4 lg:grid-cols-3">
          <div class="flex flex-col gap-4 lg:col-span-2">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="admin-glass-card h-32 animate-pulse rounded-xl"></div>
            }
          </div>
          <div class="flex flex-col gap-4">
            <div class="admin-glass-card h-64 animate-pulse rounded-xl"></div>
            <div class="admin-glass-card h-48 animate-pulse rounded-xl"></div>
          </div>
        </div>
      }
      @case ('calendar') {
        <div class="admin-glass-card h-[480px] animate-pulse rounded-xl"></div>
      }
      @case ('wizard') {
        <div class="admin-glass-card h-96 animate-pulse rounded-xl"></div>
      }
    }
  `
})
export class BookingSkeletonComponent {
  readonly variant = input<BookingSkeletonVariant>('table');
}
