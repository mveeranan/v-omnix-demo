import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, ArrowRight, Check, Upload, Clock } from 'lucide-angular';
import { AdminPageShellComponent } from '../../shared/admin-page-shell.component';
import { pageFadeIn } from '../../animations/admin.animations';
import { BookingsUiStateService } from '../data-access/bookings-ui-state.service';
import { BranchDto, WORKING_DAY_LABELS } from '../../models/branch.model';
import { dayOfWeekNumberFromIsoDate } from '../models/day-of-week.model';
import { PaymentMethod, PaymentTiming } from '../models/booking.model';
import { branchServicesToBookingOptions } from '../utils/booking-branch.util';
import { PhoneNumberFieldComponent } from '../../../../shared/ui/phone-number-field.component';
import { NotificationService } from '../../../../core/notifications/notification.service';
import {
  getWorkingDayForDate,
  isDateBookable,
  isIsoDateInPast
} from '../utils/booking-schedule.util';

@Component({
  selector: 'app-admin-booking-create',
  standalone: true,
  imports: [
    CurrencyPipe,
    FormsModule,
    AdminPageShellComponent,
    LucideAngularModule,
    PhoneNumberFieldComponent
  ],
  animations: [pageFadeIn],
  templateUrl: './admin-booking-create.component.html',
  styleUrl: './admin-booking-create.component.scss'
})
export class AdminBookingCreateComponent implements OnInit {
  readonly state = inject(BookingsUiStateService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  readonly backIcon = ArrowLeft;
  readonly nextIcon = ArrowRight;
  readonly checkIcon = Check;
  readonly uploadIcon = Upload;
  readonly clockIcon = Clock;

  readonly step = () => this.state.wizardStep();
  readonly draft = () => this.state.wizardDraft();
  readonly service = () => this.state.selectedService();
  readonly invoice = () => this.state.wizardInvoice();

  readonly calendarDays = computed(() => this.buildCalendarDays());
  readonly monthLabel = computed(() => {
    const d = this.wizardMonth();
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
  });

  private wizardMonth = computed(() => {
    const dateStr = this.state.wizardDraft().scheduledDate;
    return dateStr ? new Date(dateStr) : new Date();
  });

  readonly wizardStepLabels = ['Service', 'Customer', 'Schedule', 'Invoice', 'Review'];
  readonly invoiceTab = signal<'summary' | 'payment'>('summary');

  readonly formattedPhone = computed(
    () => this.state.formatWizardPhone() ?? '—'
  );

  readonly bookingCapture = () => this.state.wizardBookingCapture();

  readonly paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'bank-transfer', label: 'Bank Transfer' },
    { value: 'mobile-wallet', label: 'Mobile Wallet' }
  ];

  readonly requiresBranchSelection = () => this.state.wizardRequiresBranchSelection();

  ngOnInit(): void {
    if (this.state.wizardBranches().length === 0 && !this.state.wizardBranchesLoading()) {
      this.state.loadWizardBranches();
    }
  }

  goBack(): void {
    if (this.step() === 1) {
      this.state.navigateToList();
    } else if (this.step() === 4 && this.invoiceTab() === 'payment') {
      this.backToInvoiceSummary();
    } else {
      if (this.step() === 5) {
        this.invoiceTab.set('summary');
      }
      this.state.prevWizardStep();
    }
  }

  continue(): void {
    if (this.step() < this.state.totalWizardSteps) {
      if (this.step() === 4) {
        this.payLaterAndContinue();
        return;
      }
      if (this.step() === 3) {
        this.invoiceTab.set('summary');
      }
      this.state.nextWizardStep();
    }
  }

  payLaterAndContinue(): void {
    this.setPaymentTiming('pay-later');
    this.invoiceTab.set('summary');
    this.state.nextWizardStep();
  }

  openPayNowTab(): void {
    this.setPaymentTiming('pay-now');
    this.invoiceTab.set('payment');
  }

  backToInvoiceSummary(): void {
    this.invoiceTab.set('summary');
  }

  continueLabel(): string {
    if (this.step() === 4) {
      return 'Pay later and continue';
    }
    return 'Continue';
  }

  submit(): void {
    const id = this.state.submitWizard();
    if (id) {
      void this.router.navigate(['/admin/bookings', id]);
    }
  }

  canContinue(): boolean {
    return this.state.canProceedWizardStep(this.step());
  }

  selectBranch(id: string): void {
    this.state.selectWizardBranch(id);
  }

  selectService(id: string): void {
    this.state.patchWizardDraft({ serviceId: id });
  }

  selectedBranchName(): string {
    return this.state.selectedWizardBranch()?.name ?? '—';
  }

  branchServiceCount(branch: BranchDto): number {
    return branchServicesToBookingOptions(branch).length;
  }

  selectDate(iso: string): void {
    const branch = this.state.selectedWizardBranch();
    if (!branch?.workingDays?.length) {
      this.notificationService.warning(
        'Configure branch working hours before scheduling a booking.'
      );
      return;
    }
    if (isIsoDateInPast(iso)) {
      return;
    }
    if (!isDateBookable(branch, iso)) {
      this.notificationService.warning('This day is closed at the selected branch.');
      return;
    }
    this.state.patchWizardDraft({ scheduledDate: iso, scheduledTime: '' });
  }

  onScheduleTimeChange(time: string): void {
    this.state.patchWizardDraft({ scheduledTime: time });
    if (!time.trim()) {
      return;
    }
    const validation = this.state.wizardScheduleValidation();
    if (!validation.valid && validation.message) {
      this.notificationService.warning(validation.message);
    }
  }

  scheduleTimeMin(): string {
    return this.state.scheduleTimeBounds()?.min ?? '';
  }

  scheduleTimeMax(): string {
    return this.state.scheduleTimeBounds()?.max ?? '';
  }

  workingDayLabel(day: { iso: string }): string {
    const dayNumber = dayOfWeekNumberFromIsoDate(day.iso);
    if (!dayNumber) {
      return day.iso;
    }
    return WORKING_DAY_LABELS[dayNumber] ?? day.iso;
  }

  isScheduleTimeDisabled(): boolean {
    const draft = this.state.wizardDraft();
    if (!draft.scheduledDate) {
      return true;
    }
    const workingDay = this.state.scheduleWorkingDay();
    return !workingDay || workingDay.isDayOff;
  }

  setPaymentTiming(timing: PaymentTiming): void {
    this.state.patchWizardDraft({ paymentTiming: timing });
  }

  setPaymentMethod(method: PaymentMethod): void {
    this.state.patchWizardDraft({ paymentMethod: method });
  }

  onReceiptSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.state.patchWizardDraft({ receiptFileName: file.name });
    }
  }

  prevMonth(): void {
    const d = new Date(this.wizardMonth());
    d.setMonth(d.getMonth() - 1);
    this.state.patchWizardDraft({
      scheduledDate: d.toISOString().slice(0, 10)
    });
  }

  nextMonth(): void {
    const d = new Date(this.wizardMonth());
    d.setMonth(d.getMonth() + 1);
    this.state.patchWizardDraft({
      scheduledDate: d.toISOString().slice(0, 10)
    });
  }

  private buildCalendarDays(): {
    date: Date;
    iso: string;
    inMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;
    isDayOff: boolean;
  }[] {
    const ref = this.wizardMonth();
    const year = ref.getFullYear();
    const month = ref.getMonth();
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const days: ReturnType<typeof this.buildCalendarDays> = [];
    const selected = this.state.wizardDraft().scheduledDate;
    const branch = this.state.selectedWizardBranch();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(year, month, 1 - startPad);
    for (let i = 0; i < 42; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const iso = this.toLocalIsoDate(date);
      const inMonth = date.getMonth() === month;
      const isPast = isIsoDateInPast(iso);
      const workingDay = getWorkingDayForDate(branch, iso);
      const bookable = isDateBookable(branch, iso);
      const isDisabled = !inMonth || isPast || !bookable;
      days.push({
        date,
        iso,
        inMonth,
        isToday: date.getTime() === today.getTime(),
        isSelected: selected === iso,
        isDisabled,
        isDayOff: !!workingDay?.isDayOff
      });
    }
    return days;
  }

  private toLocalIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }
}
