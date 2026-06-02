import { DatePipe, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, ArrowLeft, User, Wrench, Calendar, CreditCard, Users, FileText } from 'lucide-angular';
import { AdminPageShellComponent } from '../../shared/admin-page-shell.component';
import { pageFadeIn } from '../../animations/admin.animations';
import { BookingsUiStateService } from '../data-access/bookings-ui-state.service';
import { BookingStatusBadgeComponent } from '../shared/booking-status-badge.component';
import { BookingPaymentBadgeComponent } from '../shared/booking-payment-badge.component';
import { BookingTimelineComponent } from '../shared/booking-timeline.component';
import { BookingSkeletonComponent } from '../shared/booking-skeleton.component';
import { BookingEmptyStateComponent } from '../shared/booking-empty-state.component';
import { AssignStaffModalComponent } from '../shared/assign-staff-modal.component';
import { BookingStatus } from '../models/booking.model';

@Component({
  selector: 'app-admin-booking-details',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe,
    AdminPageShellComponent,
    LucideAngularModule,
    BookingStatusBadgeComponent,
    BookingPaymentBadgeComponent,
    BookingTimelineComponent,
    BookingSkeletonComponent,
    BookingEmptyStateComponent,
    AssignStaffModalComponent
  ],
  animations: [pageFadeIn],
  templateUrl: './admin-booking-details.component.html',
  styleUrl: './admin-booking-details.component.scss'
})
export class AdminBookingDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly state = inject(BookingsUiStateService);

  readonly bookingId = signal<string | null>(null);
  readonly loading = signal(true);

  readonly backIcon = ArrowLeft;
  readonly userIcon = User;
  readonly serviceIcon = Wrench;
  readonly calendarIcon = Calendar;
  readonly paymentIcon = CreditCard;
  readonly staffIcon = Users;
  readonly notesIcon = FileText;

  readonly booking = computed(() => {
    const id = this.bookingId();
    return id ? this.state.getBookingDetail(id) : undefined;
  });

  readonly notFound = computed(() => !this.loading() && !this.booking());

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.bookingId.set(id);
      this.loading.set(true);
      setTimeout(() => this.loading.set(false), 400);
    });
  }

  goBack(): void {
    this.state.navigateToList();
  }

  confirm(): void {
    const b = this.booking();
    if (b) this.state.updateBookingStatus(b.id, 'confirmed');
  }

  assignStaff(): void {
    const b = this.booking();
    if (b) this.state.openAssignStaffModal(b.id);
  }

  startService(): void {
    const b = this.booking();
    if (b) this.state.updateBookingStatus(b.id, 'in-progress');
  }

  complete(): void {
    const b = this.booking();
    if (b) this.state.updateBookingStatus(b.id, 'completed');
  }

  cancel(): void {
    const b = this.booking();
    if (b) this.state.updateBookingStatus(b.id, 'cancelled');
  }

  canConfirm(status: BookingStatus): boolean {
    return status === 'pending';
  }

  canAssign(status: BookingStatus): boolean {
    return status === 'pending' || status === 'confirmed';
  }

  canStart(status: BookingStatus): boolean {
    return status === 'confirmed' || status === 'assigned';
  }

  canComplete(status: BookingStatus): boolean {
    return status === 'in-progress';
  }

  canCancel(status: BookingStatus): boolean {
    return status !== 'completed' && status !== 'cancelled';
  }
}
