import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ListChecks, MapPin, Pencil, Plus, Star, Wrench, X } from 'lucide-angular';
import { pageFadeIn } from '../animations/admin.animations';
import { AdminBranchesStateService } from '../data-access/admin-branches-state.service';
import {
  BranchDto,
  BranchWorkingDayFormValue,
  formatBranchWorkingHoursSummary,
  getBranchAssignedServiceIds,
  WORKING_DAY_LABELS
} from '../models/branch.model';
import { ServiceDto } from '../models/service.model';
import { AdminPageShellComponent } from '../shared/admin-page-shell.component';
import { CountryDialCodePickerComponent } from '../../../shared/ui/country-dial-code-picker.component';
import { PhoneNumberFieldComponent } from '../../../shared/ui/phone-number-field.component';
import { CountriesService } from '../../../shared/data-access/countries.service';
import {
  EMPTY_PHONE_NUMBER,
  PhoneNumberValue
} from '../../../shared/models/phone-number.model';
import { formatPhoneWithDialCode, parsePhoneNumberValue } from '../../../shared/utils/phone.util';
import { validatePhoneNumberValue } from '../../../shared/utils/phone-number.validators';
import { resolvePhoneCountry } from '../../../shared/utils/phone-country.util';
import { NotificationService } from '../../../core/notifications/notification.service';
import { getPhoneNumberFieldError } from '../../../shared/utils/phone-number.errors';

@Component({
  selector: 'app-admin-branches',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    AdminPageShellComponent,
    CountryDialCodePickerComponent,
    PhoneNumberFieldComponent
  ],
  templateUrl: './admin-branches.component.html',
  styleUrl: './admin-branches.component.scss',
  animations: [pageFadeIn]
})
export class AdminBranchesComponent implements OnInit {
  readonly state = inject(AdminBranchesStateService);
  private readonly countriesService = inject(CountriesService);
  private readonly notificationService = inject(NotificationService);

  /** Stable value for phone CVA — avoids resetting the field every change detection cycle. */
  readonly branchPhoneValue = signal<PhoneNumberValue>({ ...EMPTY_PHONE_NUMBER });
  private syncedFormPhoneNumber = '';
  private lastCountryCount = 0;

  readonly mapPinIcon = MapPin;
  readonly plusIcon = Plus;
  readonly editIcon = Pencil;
  readonly closeIcon = X;
  readonly starIcon = Star;
  readonly wrenchIcon = Wrench;
  readonly listChecksIcon = ListChecks;

  constructor() {
    effect(() => {
      if (!this.state.isFormOpen()) {
        this.syncedFormPhoneNumber = '';
        this.lastCountryCount = 0;
        return;
      }

      const countries = this.countriesService.countries();
      const countryCount = countries.length;
      const stored = this.state.formValue().phoneNumber;
      const countriesJustLoaded = countryCount > 0 && countryCount !== this.lastCountryCount;
      this.lastCountryCount = countryCount;

      if (stored === this.syncedFormPhoneNumber && !countriesJustLoaded) {
        return;
      }

      this.syncedFormPhoneNumber = stored;
      this.branchPhoneValue.set(parsePhoneNumberValue(stored, countries));
    });
  }

  ngOnInit(): void {
    this.state.load();
    this.countriesService.load();
  }

  onBranchPhoneChange(phone: PhoneNumberValue): void {
    const formatted = formatPhoneWithDialCode(phone) ?? '';
    this.syncedFormPhoneNumber = formatted;
    this.branchPhoneValue.set(phone);
    this.state.patchFormValue({ phoneNumber: formatted });
  }

  trySaveBranchForm(): void {
    const phone = this.branchPhoneValue();
    if (phone.nationalNumber.trim()) {
      const country = resolvePhoneCountry(phone, this.countriesService.countries());
      const errors = validatePhoneNumberValue(phone, { required: false, country });
      if (errors) {
        const message = getPhoneNumberFieldError(errors, country);
        this.notificationService.warning(message || 'Please enter a valid phone number.');
        return;
      }
    }
    this.state.saveForm();
  }

  formatLocation(branch: BranchDto): string {
    const parts = [branch.city, branch.addressLine1].filter((p) => p?.trim());
    return parts.length ? parts.join(' · ') : 'No address';
  }

  formatHours(branch: BranchDto): string {
    return formatBranchWorkingHoursSummary(branch.workingDays);
  }

  workingDays(): BranchWorkingDayFormValue[] {
    return this.state.formValue().workingDays;
  }

  workingDayLabel(dayNumber: number): string {
    return WORKING_DAY_LABELS[dayNumber] ?? `Day ${dayNumber}`;
  }

  patchWorkingDay(dayNumber: number, patch: Partial<BranchWorkingDayFormValue>): void {
    const workingDays = this.workingDays().map((day) =>
      day.dayNumber === dayNumber ? { ...day, ...patch } : day
    );
    this.state.patchFormValue({ workingDays });
  }

  onWorkingDayOffChange(dayNumber: number, isDayOff: boolean): void {
    this.patchWorkingDay(dayNumber, {
      isDayOff,
      ...(isDayOff ? { startTime: '', endTime: '' } : { startTime: '09:00', endTime: '18:00' })
    });
  }

  trackByBranchId(_index: number, branch: BranchDto): string {
    return branch.id ?? branch.name;
  }

  trackByServiceId(_index: number, service: ServiceDto): string {
    return service.id;
  }

  branchServiceCount(branch: BranchDto): number {
    return getBranchAssignedServiceIds(branch).length;
  }

  formatDuration(minutes: number): string {
    if (!minutes || minutes < 1) {
      return '—';
    }
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price ?? 0);
  }
}
