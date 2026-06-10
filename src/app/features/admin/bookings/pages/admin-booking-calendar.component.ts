import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { LucideAngularModule, ChevronLeft, ChevronRight, Filter, PanelLeftClose, PanelLeft } from 'lucide-angular';
import { AdminPageShellComponent } from '../../shared/admin-page-shell.component';
import { pageFadeIn } from '../../animations/admin.animations';
import { BookingsUiStateService } from '../data-access/bookings-ui-state.service';
import { BookingListItem, BookingStatus, CalendarViewMode } from '../models/booking.model';
import { BookingStatusBadgeComponent } from '../shared/booking-status-badge.component';
import { BookingEmptyStateComponent } from '../shared/booking-empty-state.component';
import { BookingSkeletonComponent } from '../shared/booking-skeleton.component';
import { bookingStatusDotClass } from '../utils/booking-status.util';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-booking-calendar',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    AdminPageShellComponent,
    LucideAngularModule,
    BookingStatusBadgeComponent,
    BookingEmptyStateComponent,
    BookingSkeletonComponent
  ],
  animations: [pageFadeIn],
  templateUrl: './admin-booking-calendar.component.html',
  styleUrl: './admin-booking-calendar.component.scss'
})
export class AdminBookingCalendarComponent implements OnInit {
  readonly state = inject(BookingsUiStateService);

  readonly prevIcon = ChevronLeft;
  readonly nextIcon = ChevronRight;
  readonly filterIcon = Filter;
  readonly panelCloseIcon = PanelLeftClose;
  readonly panelOpenIcon = PanelLeft;

  readonly loading = computed(() => this.state.loading());
  readonly view = () => this.state.calendarView();
  readonly refDate = () => this.state.calendarDate();
  readonly bookings = () => this.state.calendarBookings();

  readonly periodLabel = computed(() => {
    const d = this.state.calendarDate();
    const view = this.state.calendarView();
    if (view === 'month') {
      return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
    }
    if (view === 'week') {
      const start = this.weekStart(d);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(d);
  });

  readonly monthCells = computed(() => this.buildMonthCells());
  readonly weekDays = computed(() => this.buildWeekDays());
  readonly dayBookings = computed(() => this.bookingsForDay(this.state.calendarDate()));

  readonly hasVisibleEvents = computed(() => {
    const view = this.state.calendarView();
    if (view === 'day') return this.dayBookings().length > 0;
    return this.bookings().some((b) => this.isInVisibleRange(b));
  });

  readonly statusOptions: BookingStatus[] = [
    'pending',
    'confirmed',
    'assigned',
    'in-progress',
    'completed',
    'cancelled'
  ];

  ngOnInit(): void {
    this.state.loadBookings();
  }

  setView(view: CalendarViewMode): void {
    this.state.setCalendarView(view);
  }

  prev(): void {
    this.state.calendarPrev();
  }

  next(): void {
    this.state.calendarNext();
  }

  today(): void {
    this.state.calendarToday();
  }

  toggleFilters(): void {
    this.state.calendarFiltersOpen.update((v) => !v);
  }

  onEventClick(id: string): void {
    this.state.navigateToDetails(id);
  }

  statusDot(status: BookingStatus): string {
    return bookingStatusDotClass(status);
  }

  private weekStart(d: Date): Date {
    const start = new Date(d);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private isInVisibleRange(b: BookingListItem): boolean {
    const d = b.scheduledAt;
    const ref = this.state.calendarDate();
    const view = this.state.calendarView();
    if (view === 'month') {
      return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
    }
    if (view === 'week') {
      const start = this.weekStart(ref);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return d >= start && d < end;
    }
    return d.toDateString() === ref.toDateString();
  }

  private bookingsForDay(day: Date): BookingListItem[] {
    return this.bookings().filter((b) => b.scheduledAt.toDateString() === day.toDateString());
  }

  bookingsForDate(day: Date): BookingListItem[] {
    return this.bookingsForDay(day);
  }

  private buildMonthCells(): {
    date: Date;
    inMonth: boolean;
    isToday: boolean;
    bookings: BookingListItem[];
    overflow: number;
  }[] {
    const ref = this.state.calendarDate();
    const year = ref.getFullYear();
    const month = ref.getMonth();
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cells: ReturnType<typeof this.buildMonthCells> = [];
    const start = new Date(year, month, 1 - startPad);

    for (let i = 0; i < 42; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dayBookings = this.bookingsForDay(date);
      cells.push({
        date,
        inMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        bookings: dayBookings.slice(0, 3),
        overflow: Math.max(0, dayBookings.length - 3)
      });
    }
    return cells;
  }

  private buildWeekDays(): { date: Date; isToday: boolean; bookings: BookingListItem[] }[] {
    const start = this.weekStart(this.state.calendarDate());
    const days: ReturnType<typeof this.buildWeekDays> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push({
        date,
        isToday: date.getTime() === today.getTime(),
        bookings: this.bookingsForDay(date)
      });
    }
    return days;
  }

  weekHours(): string[] {
    return ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];
  }

  bookingsInHour(day: Date, hourIndex: number): BookingListItem[] {
    const hour = 9 + hourIndex;
    return this.bookingsForDay(day).filter((b) => b.scheduledAt.getHours() === hour);
  }
}
