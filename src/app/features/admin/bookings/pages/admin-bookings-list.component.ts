import { Component, computed, inject, OnInit } from '@angular/core';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { AdminPageShellComponent } from '../../shared/admin-page-shell.component';
import { pageFadeIn } from '../../animations/admin.animations';
import { BookingsUiStateService } from '../data-access/bookings-ui-state.service';
import { BookingStatCardsComponent } from '../shared/booking-stat-cards.component';
import { BookingFiltersBarComponent } from '../shared/booking-filters-bar.component';
import { BookingDataTableComponent } from '../shared/booking-data-table.component';
import { BookingEmptyStateComponent } from '../shared/booking-empty-state.component';
import { BookingSkeletonComponent } from '../shared/booking-skeleton.component';

@Component({
  selector: 'app-admin-bookings-list',
  standalone: true,
  imports: [
    AdminPageShellComponent,
    LucideAngularModule,
    BookingStatCardsComponent,
    BookingFiltersBarComponent,
    BookingDataTableComponent,
    BookingEmptyStateComponent,
    BookingSkeletonComponent
  ],
  animations: [pageFadeIn],
  templateUrl: './admin-bookings-list.component.html',
  styleUrl: './admin-bookings-list.component.scss'
})
export class AdminBookingsListComponent implements OnInit {
  readonly state = inject(BookingsUiStateService);
  readonly plusIcon = Plus;

  readonly hasBookings = computed(() => this.state.allBookings().length > 0);
  readonly hasFilteredResults = computed(() => this.state.filteredBookings().length > 0);
  readonly isFilteredEmpty = computed(
    () => this.hasBookings() && !this.hasFilteredResults() && !this.state.loading()
  );

  ngOnInit(): void {
    this.state.loadBookings();
  }

  onRowClick(id: string): void {
    this.state.navigateToDetails(id);
  }

  onNewBooking(): void {
    this.state.navigateToCreate();
  }

  onClearFilters(): void {
    this.state.clearFilters();
  }
}
