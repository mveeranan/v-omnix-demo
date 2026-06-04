import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';
import { BookingsUiStateService } from '../data-access/bookings-ui-state.service';
import { BookingFilters, BookingStatus } from '../models/booking.model';

@Component({
  selector: 'app-booking-filters-bar',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="admin-glass-card admin-bookings-filters rounded-xl p-4">
      <div class="admin-bookings-filters__grid">
        <div class="admin-bookings-filters__search relative">
          <lucide-icon
            [img]="searchIcon"
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="search"
            class="pf-editor-input w-full pl-10"
            placeholder="Search bookings..."
            [ngModel]="filters().search"
            (ngModelChange)="onSearch($event)"
            name="bookingSearch" />
        </div>
        <select
          class="pf-editor-input"
          [ngModel]="filters().status"
          (ngModelChange)="patch({ status: $event })"
          name="statusFilter">
          <option value="all">All statuses</option>
          @for (s of statusOptions; track s) {
            <option [value]="s">{{ statusLabels[s] }}</option>
          }
        </select>
        <select
          class="pf-editor-input"
          [ngModel]="filters().dateRange"
          (ngModelChange)="patch({ dateRange: $event })"
          name="dateFilter">
          <option value="all">All dates</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>
        <select
          class="pf-editor-input"
          [ngModel]="filters().serviceId"
          (ngModelChange)="patch({ serviceId: $event })"
          name="serviceFilter">
          <option value="all">All services</option>
          @for (svc of state.services(); track svc.id) {
            <option [value]="svc.id">{{ svc.name }}</option>
          }
        </select>
        <select
          class="pf-editor-input"
          [ngModel]="filters().staffId"
          (ngModelChange)="patch({ staffId: $event })"
          name="staffFilter">
          <option value="all">All staff</option>
          @for (member of state.staff; track member.id) {
            <option [value]="member.id">{{ member.name }}</option>
          }
        </select>
      </div>
    </div>
  `
})
export class BookingFiltersBarComponent {
  readonly state = inject(BookingsUiStateService);
  readonly clearFilters = output<void>();

  readonly searchIcon = Search;
  readonly statusOptions: BookingStatus[] = [
    'pending',
    'confirmed',
    'assigned',
    'in-progress',
    'completed',
    'cancelled'
  ];
  readonly statusLabels: Record<BookingStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    assigned: 'Assigned',
    'in-progress': 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

  filters = () => this.state.filters();

  onSearch(value: string): void {
    this.state.setFilters({ search: value });
  }

  patch(patch: Partial<BookingFilters>): void {
    this.state.setFilters(patch);
  }
}
