import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { BranchService } from '../../data-access/branch.service';
import { TenantContextService } from '../../data-access/tenant-context.service';
import { BranchDto, pickPrimaryBranch } from '../../models/branch.model';
import {
  BookingDetail,
  BookingFilters,
  BookingListItem,
  BookingStats,
  BookingStatus,
  BookingWizardDraft,
  CalendarViewMode,
  DEFAULT_BOOKING_FILTERS,
  DEFAULT_WIZARD_DRAFT,
  WizardBookingCapture,
  WizardBookingSubmitPayload
} from '../models/booking.model';
import {
  MOCK_BOOKING_DETAILS,
  MOCK_SERVICES,
  MOCK_STAFF,
  MOCK_TIME_SLOTS,
  toListItem
} from '../data/booking-mock.data';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { CountriesService } from '../../../../shared/data-access/countries.service';
import { EMPTY_PHONE_NUMBER } from '../../../../shared/models/phone-number.model';
import { formatPhoneWithDialCode, resolvePhoneCountry } from '../../../../shared/utils/phone.util';
import { validatePhoneNumberValue } from '../../../../shared/utils/phone-number.validators';
import { buildTimeline } from '../utils/booking-timeline.util';
import {
  aggregateBookingServiceOptions,
  branchServicesToBookingOptions
} from '../utils/booking-branch.util';
import {
  buildLocalScheduledRange,
  formatLocalDateTime,
  formatWorkingDayHoursHint,
  getScheduleTimeBounds,
  getWorkingDayForDate,
  toUtcIsoString,
  validateBookingSchedule
} from '../utils/booking-schedule.util';

@Injectable({ providedIn: 'root' })
export class BookingsUiStateService {
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  private readonly countriesService = inject(CountriesService);
  private readonly branchApi = inject(BranchService);
  private readonly authService = inject(AuthService);
  private readonly tenantContext = inject(TenantContextService);

  private readonly bookings = signal<BookingDetail[]>([...MOCK_BOOKING_DETAILS]);
  readonly loading = signal(true);
  readonly filters = signal<BookingFilters>({ ...DEFAULT_BOOKING_FILTERS });
  readonly wizardStep = signal(1);
  readonly wizardDraft = signal<BookingWizardDraft>({ ...DEFAULT_WIZARD_DRAFT });
  readonly assignStaffModalOpen = signal(false);
  readonly assignStaffBookingId = signal<string | null>(null);
  readonly calendarView = signal<CalendarViewMode>('month');
  readonly calendarDate = signal(new Date());
  readonly calendarFiltersOpen = signal(true);

  readonly wizardBranches = signal<BranchDto[]>([]);
  readonly wizardBranchesLoading = signal(false);
  readonly wizardBranchesError = signal<string | null>(null);

  readonly wizardRequiresBranchSelection = this.tenantContext.isMultiBranchTenant;

  readonly services = computed(() => {
    const fromBranches = aggregateBookingServiceOptions(this.wizardBranches());
    return fromBranches.length > 0 ? fromBranches : MOCK_SERVICES;
  });
  readonly staff = MOCK_STAFF;
  readonly timeSlots = MOCK_TIME_SLOTS;
  readonly totalWizardSteps = 5;

  readonly allBookings = computed(() => this.bookings().map(toListItem));

  readonly stats = computed<BookingStats>(() => {
    const list = this.bookings();
    return {
      total: list.length,
      pending: list.filter((b) => b.status === 'pending').length,
      confirmed: list.filter((b) => b.status === 'confirmed').length,
      inProgress: list.filter((b) => b.status === 'in-progress').length,
      completed: list.filter((b) => b.status === 'completed').length,
      cancelled: list.filter((b) => b.status === 'cancelled').length
    };
  });

  readonly filteredBookings = computed(() => {
    const f = this.filters();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    return this.allBookings().filter((b) => {
      const detail = this.getBookingDetail(b.id);
      if (!detail) return false;

      if (f.search.trim()) {
        const q = f.search.toLowerCase();
        const haystack = [
          b.displayId,
          b.customerName,
          b.phone,
          b.serviceName,
          b.branchName,
          b.staffName ?? ''
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (f.status !== 'all' && b.status !== f.status) return false;
      if (f.serviceId !== 'all' && b.serviceId !== f.serviceId) return false;
      if (f.staffId !== 'all' && b.staffId !== f.staffId) return false;

      if (f.dateRange !== 'all') {
        const d = b.scheduledAt;
        if (f.dateRange === 'today') {
          if (d < startOfToday || d >= endOfToday) return false;
        } else if (f.dateRange === 'week') {
          const weekEnd = new Date(startOfToday);
          weekEnd.setDate(weekEnd.getDate() + 7);
          if (d < startOfToday || d >= weekEnd) return false;
        } else if (f.dateRange === 'month') {
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          if (d < startOfToday || d >= monthEnd) return false;
        }
      }

      return true;
    });
  });

  readonly wizardProgress = computed(
    () => Math.round((this.wizardStep() / this.totalWizardSteps) * 100)
  );

  readonly selectedWizardBranch = computed(() => {
    const id = this.wizardDraft().branchId;
    if (!id) {
      return null;
    }
    return this.wizardBranches().find((b) => b.id === id) ?? null;
  });

  readonly wizardServiceOptions = computed(() =>
    branchServicesToBookingOptions(this.selectedWizardBranch())
  );

  readonly selectedService = computed(() => {
    const id = this.wizardDraft().serviceId;
    return this.wizardServiceOptions().find((s) => s.id === id) ?? null;
  });

  readonly scheduleWorkingDay = computed(() => {
    const branch = this.selectedWizardBranch();
    const isoDate = this.wizardDraft().scheduledDate;
    if (!branch || !isoDate) {
      return undefined;
    }
    return getWorkingDayForDate(branch, isoDate);
  });

  readonly scheduleTimeBounds = computed(() =>
    getScheduleTimeBounds(
      this.scheduleWorkingDay(),
      this.selectedService()?.durationMinutes ?? 0
    )
  );

  readonly scheduleHoursHint = computed(() =>
    formatWorkingDayHoursHint(
      this.scheduleWorkingDay(),
      this.selectedService()?.durationMinutes ?? 0
    )
  );

  readonly wizardScheduleValidation = computed(() =>
    validateBookingSchedule(
      this.scheduleWorkingDay(),
      this.wizardDraft().scheduledTime,
      this.selectedService()?.durationMinutes ?? 0
    )
  );

  readonly isWizardScheduleValid = computed(() => this.wizardScheduleValidation().valid);

  readonly wizardScheduledRange = computed(() => {
    const d = this.wizardDraft();
    const duration = this.selectedService()?.durationMinutes ?? 0;
    if (!d.scheduledDate || !d.scheduledTime.trim()) {
      return null;
    }
    return buildLocalScheduledRange(d.scheduledDate, d.scheduledTime, duration);
  });

  readonly wizardScheduleEndTime = computed(() => {
    if (!this.isWizardScheduleValid()) {
      return '';
    }
    return this.wizardScheduledRange()?.endTimeInput ?? '';
  });

  readonly wizardBookingCapture = computed((): WizardBookingCapture => {
    const d = this.wizardDraft();
    const svc = this.selectedService();
    const phone = this.formatWizardPhone(d);
    const range = this.wizardScheduledRange();
    const isScheduleComplete = this.isWizardScheduleValid();

    return {
      branchId: d.branchId,
      serviceId: d.serviceId,
      serviceName: svc?.name ?? '',
      customerName: d.customerName.trim(),
      email: d.email.trim(),
      phoneNumber: phone,
      scheduledDate: d.scheduledDate,
      scheduledStartTime: d.scheduledTime.trim(),
      scheduledEndTime: isScheduleComplete ? this.wizardScheduleEndTime() : '',
      startDateTimeLocal: range ? formatLocalDateTime(range.startLocal) : '',
      endDateTimeLocal: range && isScheduleComplete ? formatLocalDateTime(range.endLocal) : '',
      startDateTimeUtc: range ? toUtcIsoString(range.startLocal) : '',
      endDateTimeUtc: range && isScheduleComplete ? toUtcIsoString(range.endLocal) : '',
      isScheduleComplete
    };
  });

  readonly wizardInvoice = computed(() => {
    const svc = this.selectedService();
    if (!svc) return { subtotal: 0, tax: 0, total: 0, taxRate: 0.08 };
    const subtotal = svc.price;
    const taxRate = 0.08;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    return { subtotal, tax, total, taxRate };
  });

  readonly calendarBookings = computed(() => {
    const f = this.filters();
    return this.allBookings().filter((b) => {
      if (f.status !== 'all' && b.status !== f.status) return false;
      if (f.serviceId !== 'all' && b.serviceId !== f.serviceId) return false;
      if (f.staffId !== 'all' && b.staffId !== f.staffId) return false;
      return true;
    });
  });

  constructor() {
    this.loadBookings();
    this.loadWizardBranches();
  }

  loadBookings(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 600);
  }

  setFilters(patch: Partial<BookingFilters>): void {
    this.filters.update((f) => ({ ...f, ...patch }));
  }

  clearFilters(): void {
    this.filters.set({ ...DEFAULT_BOOKING_FILTERS });
  }

  getBookingDetail(id: string): BookingDetail | undefined {
    return this.bookings().find((b) => b.id === id);
  }

  getBookingById(id: string): BookingListItem | undefined {
    const d = this.getBookingDetail(id);
    return d ? toListItem(d) : undefined;
  }

  updateBookingStatus(id: string, status: BookingStatus): void {
    this.bookings.update((list) =>
      list.map((b) => {
        if (b.id !== id) return b;
        const updated = { ...b, status };
        updated.timeline = buildTimeline(status, b.scheduledAt);
        return updated;
      })
    );
    this.notifications.success('Booking updated', `Status changed to ${status.replace('-', ' ')}.`);
  }

  assignStaff(bookingId: string, staffId: string): void {
    const member = this.staff.find((s) => s.id === staffId);
    if (!member) return;

    this.bookings.update((list) =>
      list.map((b) => {
        if (b.id !== bookingId) return b;
        const status: BookingStatus = b.status === 'pending' || b.status === 'confirmed' ? 'assigned' : b.status;
        const updated: BookingDetail = {
          ...b,
          staffId: member.id,
          staffName: member.name,
          status,
          timeline: buildTimeline(status, b.scheduledAt)
        };
        return updated;
      })
    );
    this.closeAssignStaffModal();
    this.notifications.success('Staff assigned', `${member.name} has been assigned.`);
  }

  openAssignStaffModal(bookingId: string): void {
    this.assignStaffBookingId.set(bookingId);
    this.assignStaffModalOpen.set(true);
  }

  closeAssignStaffModal(): void {
    this.assignStaffModalOpen.set(false);
    this.assignStaffBookingId.set(null);
  }

  resetWizard(): void {
    this.wizardStep.set(1);
    this.wizardDraft.set(this.createDefaultWizardDraft());
    this.loadWizardBranches();
  }

  loadWizardBranches(): void {
    const tenantId = this.authService.getTenantId();
    if (!tenantId) {
      this.wizardBranches.set([]);
      this.wizardBranchesError.set('No tenant selected. Please log in and select a workspace.');
      this.wizardBranchesLoading.set(false);
      return;
    }

    this.wizardBranchesLoading.set(true);
    this.wizardBranchesError.set(null);

    this.branchApi
      .listByTenant(tenantId)
      .pipe(
        tap((items) => {
          const active = items.filter((b) => b.isActive !== false);
          this.wizardBranches.set(active);
          this.applyWizardBranchDefaults(active);
        }),
        catchError((error: unknown) => {
          const message =
            error instanceof Error ? error.message : 'Could not load branches and services.';
          this.wizardBranches.set([]);
          this.wizardBranchesError.set(message);
          this.notifications.error('Branches unavailable', message);
          return EMPTY;
        }),
        finalize(() => this.wizardBranchesLoading.set(false))
      )
      .subscribe();
  }

  selectWizardBranch(branchId: string): void {
    const current = this.wizardDraft();
    const branchChanged = current.branchId !== branchId;
    this.patchWizardDraft({
      branchId,
      ...(branchChanged
        ? { serviceId: '', scheduledDate: '', scheduledTime: '' }
        : {})
    });
  }

  private applyWizardBranchDefaults(branches: BranchDto[]): void {
    const primary = pickPrimaryBranch(branches);
    if (!primary?.id) {
      return;
    }

    if (!this.wizardRequiresBranchSelection()) {
      this.patchWizardDraft({ branchId: primary.id });
      return;
    }

    const currentBranchId = this.wizardDraft().branchId;
    if (currentBranchId && branches.some((b) => b.id === currentBranchId)) {
      return;
    }

    if (branches.length === 1) {
      this.patchWizardDraft({ branchId: branches[0].id! });
    }
  }

  createDefaultWizardDraft(): BookingWizardDraft {
    const countries = this.countriesService.countries();
    const preferred =
      countries.length > 0
        ? this.countriesService.preferredDialCode(countries)
        : '+971';
    const preferredCountry =
      countries.find((c) => c.dialCode === preferred) ?? countries[0];
    return {
      ...DEFAULT_WIZARD_DRAFT,
      phone: {
        ...EMPTY_PHONE_NUMBER,
        dialCode: preferred,
        countryId: preferredCountry?.id
      }
    };
  }

  formatWizardPhone(draft: BookingWizardDraft = this.wizardDraft()): string | null {
    return formatPhoneWithDialCode(draft.phone);
  }

  patchWizardDraft(patch: Partial<BookingWizardDraft>): void {
    this.wizardDraft.update((d) => {
      const next = { ...d, ...patch };
      if (patch.serviceId !== undefined && patch.serviceId !== d.serviceId && next.scheduledTime) {
        const validation = validateBookingSchedule(
          getWorkingDayForDate(this.selectedWizardBranch(), next.scheduledDate),
          next.scheduledTime,
          this.wizardServiceOptions().find((s) => s.id === next.serviceId)?.durationMinutes ?? 0
        );
        if (!validation.valid) {
          next.scheduledTime = '';
        }
      }
      return next;
    });
  }

  nextWizardStep(): void {
    this.wizardStep.update((s) => Math.min(s + 1, this.totalWizardSteps));
  }

  prevWizardStep(): void {
    this.wizardStep.update((s) => Math.max(s - 1, 1));
  }

  canProceedWizardStep(step: number): boolean {
    const d = this.wizardDraft();
    switch (step) {
      case 1: {
        if (this.wizardRequiresBranchSelection() && !d.branchId) {
          return false;
        }
        if (!d.branchId) {
          return false;
        }
        return !!d.serviceId;
      }
      case 2: {
        const country = resolvePhoneCountry(d.phone, this.countriesService.countries());
        return (
          d.customerName.trim().length > 0 &&
          !validatePhoneNumberValue(d.phone, { required: true, country })
        );
      }
      case 3:
        return (
          !!d.scheduledDate && !!d.scheduledTime.trim() && this.isWizardScheduleValid()
        );
      case 4:
      case 5:
        return this.isWizardBookingCaptureComplete();
      default:
        return false;
    }
  }

  isWizardBookingCaptureComplete(): boolean {
    const capture = this.wizardBookingCapture();
    return (
      !!capture.branchId &&
      !!capture.serviceId &&
      !!capture.customerName &&
      !!capture.phoneNumber &&
      capture.isScheduleComplete &&
      !!capture.startDateTimeUtc &&
      !!capture.endDateTimeUtc
    );
  }

  buildWizardSubmitPayload(): WizardBookingSubmitPayload | null {
    if (!this.isWizardBookingCaptureComplete()) {
      return null;
    }
    const d = this.wizardDraft();
    const capture = this.wizardBookingCapture();
    return {
      branchId: capture.branchId,
      serviceId: capture.serviceId,
      customerName: capture.customerName,
      email: capture.email || null,
      phoneNumber: capture.phoneNumber!,
      startDateTimeUtc: capture.startDateTimeUtc,
      endDateTimeUtc: capture.endDateTimeUtc,
      notes: d.notes.trim() || null,
      paymentTiming: d.paymentTiming,
      paymentMethod: d.paymentMethod
    };
  }

  submitWizard(): string | null {
    const d = this.wizardDraft();
    const svc = this.selectedService();
    const branch = this.selectedWizardBranch();
    const payload = this.buildWizardSubmitPayload();
    const range = this.wizardScheduledRange();
    if (!svc || !branch?.id || !payload || !range) {
      return null;
    }

    const nextId = this.bookings().length + 1;
    const scheduledAt = range.startLocal;
    const scheduledEndAt = range.endLocal;

    const price = svc.price;
    const taxRate = 0.08;
    const taxAmount = Math.round(price * taxRate * 100) / 100;
    const totalAmount = Math.round((price + taxAmount) * 100) / 100;
    const status: BookingStatus = 'pending';
    const paymentStatus = d.paymentTiming === 'pay-now' ? 'paid' : 'pending';

    const newBooking: BookingDetail = {
      id: `bk-${nextId}`,
      displayId: `BK-${String(nextId).padStart(4, '0')}`,
      customerName: payload.customerName,
      phone: payload.phoneNumber,
      email: payload.email || undefined,
      serviceId: payload.serviceId,
      serviceName: svc.name,
      branchId: payload.branchId,
      branchName: branch.name,
      scheduledAt,
      scheduledEndAt,
      status,
      paymentStatus,
      durationMinutes: svc.durationMinutes,
      price,
      notes: d.notes || undefined,
      taxRate,
      taxAmount,
      totalAmount,
      paymentTiming: d.paymentTiming,
      paymentMethod: d.paymentMethod,
      receiptFileName: d.receiptFileName || undefined,
      timeline: buildTimeline(status, new Date())
    };

    this.bookings.update((list) => [newBooking, ...list]);
    this.resetWizard();
    this.notifications.success('Booking created', `${newBooking.displayId} has been submitted.`);
    return newBooking.id;
  }

  setCalendarView(view: CalendarViewMode): void {
    this.calendarView.set(view);
  }

  setCalendarDate(date: Date): void {
    this.calendarDate.set(new Date(date));
  }

  calendarPrev(): void {
    const d = new Date(this.calendarDate());
    const view = this.calendarView();
    if (view === 'month') d.setMonth(d.getMonth() - 1);
    else if (view === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    this.calendarDate.set(d);
  }

  calendarNext(): void {
    const d = new Date(this.calendarDate());
    const view = this.calendarView();
    if (view === 'month') d.setMonth(d.getMonth() + 1);
    else if (view === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    this.calendarDate.set(d);
  }

  calendarToday(): void {
    this.calendarDate.set(new Date());
  }

  navigateToDetails(id: string): void {
    void this.router.navigate(['/admin/bookings', id]);
  }

  navigateToCreate(): void {
    this.wizardStep.set(1);
    this.wizardDraft.set(this.createDefaultWizardDraft());
    this.loadWizardBranches();
    void this.router.navigate(['/admin/bookings/new']);
  }

  navigateToList(): void {
    void this.router.navigate(['/admin/bookings']);
  }
}
