import { Component, input } from '@angular/core';
import { PaymentStatus } from '../models/booking.model';
import { paymentStatusClass, paymentStatusLabel } from '../utils/booking-payment-status.util';

@Component({
  selector: 'app-booking-payment-badge',
  standalone: true,
  template: `
    <span class="admin-status-pill inline-flex border px-2 py-0.5 text-xs font-medium {{ badgeClass() }}">
      {{ label() }}
    </span>
  `
})
export class BookingPaymentBadgeComponent {
  readonly status = input.required<PaymentStatus>();

  badgeClass = () => paymentStatusClass(this.status());
  label = () => paymentStatusLabel(this.status());
}
