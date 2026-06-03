import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule, ArrowLeft, ArrowRight, Check, Clock, FileText, X } from 'lucide-angular';
import { AdminPageShellComponent } from '../../shared/admin-page-shell.component';
import { pageFadeIn } from '../../animations/admin.animations';
import { BookingsUiStateService } from '../data-access/bookings-ui-state.service';
import { DocumentUploadService } from '../../data-access/document-upload.service';
import { BranchDto, WORKING_DAY_LABELS } from '../../models/branch.model';
import { dayOfWeekNumberFromIsoDate } from '../models/day-of-week.model';
import { PaymentTiming } from '../models/booking.model';
import { DEFAULT_TENANT_PAYMENT_INSTRUCTIONS } from '../data/booking-payment.data';
import {
  formatPaymentMethodLabel,
  paymentMethodRequiresReceipt,
  type PaymentMethod
} from '../models/payment-method.model';
import { branchServicesToBookingOptions } from '../utils/booking-branch.util';
import { PhoneNumberFieldComponent } from '../../../../shared/ui/phone-number-field.component';
import { MediaUploadZoneComponent } from '../../../../shared/ui/media-upload-zone.component';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { FileCategory } from '../../../../shared/files/file-category.enum';
import {
  getWorkingDayForDate,
  isDateBookable,
  isIsoDateInPast
} from '../utils/booking-schedule.util';

const RECEIPT_ACCEPT = 'image/png,image/jpeg,image/webp,application/pdf,.pdf';
const RECEIPT_MAX_MB = 5;

@Component({
  selector: 'app-admin-booking-create',
  standalone: true,
  imports: [
    CurrencyPipe,
    FormsModule,
    AdminPageShellComponent,
    LucideAngularModule,
    PhoneNumberFieldComponent,
    MediaUploadZoneComponent
  ],
  animations: [pageFadeIn],
  templateUrl: './admin-booking-create.component.html',
  styleUrl: './admin-booking-create.component.scss'
})
export class AdminBookingCreateComponent implements OnInit {
  readonly state = inject(BookingsUiStateService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly documentUpload = inject(DocumentUploadService);

  readonly backIcon = ArrowLeft;
  readonly nextIcon = ArrowRight;
  readonly checkIcon = Check;
  readonly clockIcon = Clock;
  readonly fileIcon = FileText;
  readonly removeIcon = X;

  readonly step = () => this.state.wizardStep();
  readonly draft = () => this.state.wizardDraft();
  readonly selectedServices = () => this.state.selectedServices();
  readonly totalDurationMinutes = () => this.state.wizardTotalDurationMinutes();
  readonly invoice = () => this.state.wizardInvoice();

  readonly submitting = signal(false);
  readonly receiptFile = signal<File | null>(null);
  readonly receiptPreviewUrl = signal('');

  readonly receiptIsImage = computed(() => {
    const file = this.receiptFile();
    return !!file?.type.startsWith('image/');
  });

  readonly calendarDays = computed(() => this.buildCalendarDays());
  readonly monthLabel = computed(() => {
    const d = this.wizardMonth();
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
  });

  private wizardMonth = computed(() => {
    const dateStr = this.state.wizardDraft().scheduledDate;
    return dateStr ? new Date(dateStr) : new Date();
  });

  readonly wizardStepLabels = ['Service', 'Customer', 'Schedule', 'Summary'];
  readonly formattedPhone = computed(
    () => this.state.formatWizardPhone() ?? '—'
  );

  readonly bookingCapture = () => this.state.wizardBookingCapture();
  readonly receiptAccept = RECEIPT_ACCEPT;

  readonly paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank-transfer', label: 'Bank Transfer' }
  ];

  readonly paymentInstructions = DEFAULT_TENANT_PAYMENT_INSTRUCTIONS;
  readonly formatPaymentMethodLabel = formatPaymentMethodLabel;
  readonly paymentMethodRequiresReceipt = paymentMethodRequiresReceipt;

  readonly requiresBranchSelection = () => this.state.wizardRequiresBranchSelection();

  constructor() {
    effect(() => {
      if (this.state.wizardStep() < 4) {
        this.clearReceipt();
      }
    });
  }

  ngOnInit(): void {
    if (this.state.wizardBranches().length === 0 && !this.state.wizardBranchesLoading()) {
      this.state.loadWizardBranches();
    }
  }

  goBack(): void {
    if (this.step() === 1) {
      this.state.navigateToList();
    } else {
      this.state.prevWizardStep();
    }
  }

  continue(): void {
    if (this.step() < this.state.totalWizardSteps) {
      this.state.nextWizardStep();
    }
  }

  choosePayNow(): void {
    const nextTiming: PaymentTiming =
      this.draft().paymentTiming === 'pay-now' ? 'pay-later' : 'pay-now';
    this.setPaymentTiming(nextTiming);
    if (nextTiming === 'pay-later') {
      this.clearReceipt();
    }
  }

  continueLabel(): string {
    return 'Continue';
  }

  async submit(): Promise<void> {
    if (this.submitting()) {
      return;
    }

    const draft = this.draft();
    if (this.step() === 4 && draft.paymentTiming !== 'pay-now') {
      this.setPaymentTiming('pay-later');
    }

    if (
      this.step() === 4 &&
      draft.paymentTiming === 'pay-now' &&
      paymentMethodRequiresReceipt(draft.paymentMethod)
    ) {
      const file = this.receiptFile();
      if (!file) {
        this.notificationService.warning('Upload a payment receipt to continue.');
        return;
      }

      this.submitting.set(true);
      try {
        const uploaded = await firstValueFrom(
          this.documentUpload.upload(file, FileCategory.InvoiceDocument)
        );
        this.state.patchWizardDraft({
          receiptDocumentId: uploaded.documentId,
          receiptFileName: file.name
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Could not upload payment receipt.';
        this.notificationService.error(message);
        this.submitting.set(false);
        return;
      }
      this.submitting.set(false);
    }

    const id = this.state.submitWizard();
    if (id) {
      this.clearReceipt();
      void this.router.navigate(['/admin/bookings', id]);
    }
  }

  submitLabel(): string {
    if (this.step() === 4 && this.draft().paymentTiming !== 'pay-now') {
      return 'Pay later and submit';
    }
    return 'Submit booking';
  }

  canContinue(): boolean {
    if (this.submitting()) {
      return false;
    }
    if (this.step() === 4) {
      const draft = this.draft();
      if (draft.paymentTiming !== 'pay-now') {
        return this.state.canProceedWizardStep(4);
      }
      if (!draft.paymentMethod) {
        return false;
      }
      if (paymentMethodRequiresReceipt(draft.paymentMethod) && !this.receiptFile()) {
        return false;
      }
      return this.state.canProceedWizardStep(4);
    }
    return this.state.canProceedWizardStep(this.step());
  }

  selectBranch(id: string): void {
    this.state.selectWizardBranch(id);
  }

  toggleService(id: string): void {
    this.state.toggleWizardService(id);
  }

  isServiceSelected(id: string): boolean {
    return this.state.isWizardServiceSelected(id);
  }

  selectedServicesCount(): number {
    return this.draft().serviceIds.length;
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
    const current = this.draft().paymentMethod;
    this.state.patchWizardDraft({ paymentMethod: method });
    if (current !== method) {
      this.clearReceipt();
    }
  }

  onReceiptSelected(event: { file: File; dataUrl: string }): void {
    const { file, dataUrl } = event;
    if (!this.isAllowedReceiptFile(file)) {
      return;
    }
    this.receiptFile.set(file);
    this.receiptPreviewUrl.set(file.type.startsWith('image/') ? dataUrl : '');
    this.state.patchWizardDraft({
      receiptFileName: file.name,
      receiptDocumentId: ''
    });
  }

  onReceiptCleared(): void {
    this.clearReceipt();
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private clearReceipt(): void {
    this.receiptFile.set(null);
    this.receiptPreviewUrl.set('');
    this.state.patchWizardDraft({ receiptFileName: '', receiptDocumentId: '' });
  }

  private isAllowedReceiptFile(file: File): boolean {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      this.notificationService.warning('Please upload a PNG, JPG, WebP, or PDF file.');
      return false;
    }
    if (file.size > RECEIPT_MAX_MB * 1024 * 1024) {
      this.notificationService.warning(`Receipt must be under ${RECEIPT_MAX_MB} MB.`);
      return false;
    }
    return true;
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
