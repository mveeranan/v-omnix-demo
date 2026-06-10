import { DatePipe } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { LucideAngularModule, Eye, MoreHorizontal } from 'lucide-angular';
import { BookingListItem } from '../models/booking.model';
import { AppTableComponent } from '../../../../shared/ui/app-table.component';
import { ICON_SIZE_INLINE } from '../../../../shared/ui/icon.constants';
import { BookingStatusBadgeComponent } from './booking-status-badge.component';
import { BookingPaymentBadgeComponent } from './booking-payment-badge.component';

@Component({
  selector: 'app-booking-data-table',
  standalone: true,
  imports: [
    DatePipe,
    LucideAngularModule,
    AppTableComponent,
    BookingStatusBadgeComponent,
    BookingPaymentBadgeComponent
  ],
  template: `
    <app-table>
        <table class="admin-bookings-table w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Service</th>
              <th>Branch</th>
              <th>Staff</th>
              <th>Date &amp; Time</th>
              <th>Status</th>
              <th>Payment</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (row of bookings(); track row.id) {
              <tr
                class="admin-bookings-table__row cursor-pointer"
                (click)="rowClick.emit(row.id)"
                (keydown.enter)="rowClick.emit(row.id)"
                tabindex="0"
                role="button"
                [attr.aria-label]="'View booking ' + row.displayId">
                <td class="font-medium text-[var(--accent)]">{{ row.displayId }}</td>
                <td>{{ row.customerName }}</td>
                <td class="text-[var(--text-muted)]">{{ row.phone }}</td>
                <td>{{ row.serviceName }}</td>
                <td>{{ row.branchName }}</td>
                <td>{{ row.staffName ?? '—' }}</td>
                <td>
                  <span class="block">{{ row.scheduledAt | date: 'MMM d, y' }}</span>
                  <span class="text-xs text-[var(--text-muted)]">{{
                    row.scheduledAt | date: 'h:mm a'
                  }}</span>
                </td>
                <td>
                  <app-booking-status-badge [status]="row.status" />
                </td>
                <td>
                  <app-booking-payment-badge [status]="row.paymentStatus" />
                </td>
                <td class="text-right">
                  <button
                    type="button"
                    class="admin-bookings-icon-btn inline-flex"
                    aria-label="View booking"
                    (click)="onView($event, row.id)">
                    <lucide-icon [img]="viewIcon" [class]="iconSize" />
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
    </app-table>
  `
})
export class BookingDataTableComponent {
  readonly bookings = input.required<BookingListItem[]>();
  readonly rowClick = output<string>();

  readonly iconSize = ICON_SIZE_INLINE;
  readonly viewIcon = Eye;
  readonly moreIcon = MoreHorizontal;

  onView(event: Event, id: string): void {
    event.stopPropagation();
    this.rowClick.emit(id);
  }
}
