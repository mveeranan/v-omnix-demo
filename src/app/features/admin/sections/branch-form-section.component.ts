import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MapPin } from 'lucide-angular';
import { AdminFormSectionCardComponent } from '../shared/admin-form-section-card.component';
import { AdminModalShellComponent } from '../shared/admin-modal-shell.component';
import { AdminDetailFieldComponent } from '../shared/admin-detail-field.component';
import { AdminProfileStateService } from '../data-access/admin-profile-state.service';
import {
  BranchUpdateRequest,
  BranchWorkingDayFormValue,
  createDefaultWorkingDaysFormValues,
  formatBranchWorkingHoursSummary,
  formWorkingDaysToApi,
  readBranchCountryCode,
  timeSpanToInputValue,
  validateWorkingDaysForm,
  workingDaysToFormValues,
  WORKING_DAY_LABELS
} from '../models/branch.model';
import { CountriesService } from '../../../shared/data-access/countries.service';
import { CountryDialCodePickerComponent } from '../../../shared/ui/country-dial-code-picker.component';

interface BranchFormSnapshot {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  countryCode: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  phoneNumber: string;
  email: string;
  workingDays: BranchWorkingDayFormValue[];
  isActive: boolean;
}

@Component({
  selector: 'app-branch-form-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AdminFormSectionCardComponent,
    AdminDetailFieldComponent,
    CountryDialCodePickerComponent,
    AdminModalShellComponent
  ],
  template: `
    <app-admin-form-section-card
      title="Primary branch"
      subtitle="Location & hours"
      [icon]="sectionIcon"
      [complete]="state.branchComplete()"
      [(expanded)]="expanded"
      [editing]="false"
      [lastSavedAt]="state.branchLastSavedAt()"
      (edit)="startEdit()"
    >
      <div class="admin-detail-view">
          <app-admin-detail-field label="Branch name" [value]="displayValue('name')" />
          <app-admin-detail-field label="Address line 1" [value]="displayValue('addressLine1')" />
          <app-admin-detail-field label="Address line 2" [value]="displayValue('addressLine2')" />
          <div class="admin-detail-view__grid admin-detail-view__grid--2">
            <app-admin-detail-field label="City" [value]="displayValue('city')" />
            <app-admin-detail-field label="Country" [value]="selectedCountryName()" />
          </div>
          <app-admin-detail-field label="Postal code" [value]="displayValue('postalCode')" />
          <div class="admin-detail-view__grid admin-detail-view__grid--2">
            <app-admin-detail-field label="Latitude" [value]="displayNumber('latitude')" />
            <app-admin-detail-field label="Longitude" [value]="displayNumber('longitude')" />
          </div>
          <div class="admin-detail-view__grid admin-detail-view__grid--2">
            <app-admin-detail-field label="Phone" [value]="displayValue('phoneNumber')" />
            <app-admin-detail-field label="Email" [value]="displayValue('email')" />
          </div>
          <app-admin-detail-field label="Working hours" [value]="displayWorkingHours()" />
          <div class="admin-detail-field">
            <span class="pf-editor-label">Status</span>
            <span
              class="admin-detail-status mt-1 w-fit"
              [class.admin-detail-status--active]="form.getRawValue().isActive"
              [class.admin-detail-status--inactive]="!form.getRawValue().isActive">
              {{ form.getRawValue().isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <app-admin-detail-field label="Primary branch" value="Yes" />
        </div>
    </app-admin-form-section-card>

    @if (editing()) {
      <app-admin-modal-shell
        [open]="true"
        title="Edit primary branch"
        subtitle="Update location, contact details, and working hours."
        panelClass="admin-modal-panel--xl"
        [disableClose]="state.branchSaving()"
        (close)="cancelEdit()">
        <form class="pf-editor-fields" [formGroup]="form">
          <div class="pf-editor-field">
            <span class="pf-editor-label">Branch name <span class="text-rose-500">*</span></span>
            <input class="pf-editor-input" formControlName="name" />
            @if (form.controls.name.touched && form.controls.name.invalid) {
              <p class="pf-editor-error">Branch name is required (max 200 characters).</p>
            }
          </div>

          <div class="pf-editor-field">
            <span class="pf-editor-label">Address line 1</span>
            <input class="pf-editor-input" formControlName="addressLine1" />
          </div>

          <div class="pf-editor-field">
            <span class="pf-editor-label">Address line 2</span>
            <input class="pf-editor-input" formControlName="addressLine2" />
          </div>

          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            <div class="pf-editor-field">
              <span class="pf-editor-label">City</span>
              <input class="pf-editor-input" formControlName="city" />
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Country</span>
              <app-country-dial-code-picker formControlName="countryCode" mode="iso" />
            </div>
          </div>

          <div class="pf-editor-field">
            <span class="pf-editor-label">Postal code</span>
            <input class="pf-editor-input" formControlName="postalCode" />
          </div>

          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            <div class="pf-editor-field">
              <span class="pf-editor-label">Latitude</span>
              <input class="pf-editor-input" type="number" step="any" formControlName="latitude" />
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Longitude</span>
              <input class="pf-editor-input" type="number" step="any" formControlName="longitude" />
            </div>
          </div>

          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            <div class="pf-editor-field">
              <span class="pf-editor-label">Phone</span>
              <input class="pf-editor-input" formControlName="phoneNumber" />
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Email</span>
              <input class="pf-editor-input" type="email" formControlName="email" />
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <p class="pf-editor-error">Enter a valid email address.</p>
              }
            </div>
          </div>

          <div class="pf-editor-field">
            <span class="pf-editor-label">Working hours</span>
            <div class="branch-working-days-table">
              @for (day of workingDays(); track day.dayNumber) {
                <div class="branch-working-days-row">
                  <span class="branch-working-days-day">{{ workingDayLabel(day.dayNumber) }}</span>
                  <label class="branch-working-days-off">
                    <input
                      type="checkbox"
                      [checked]="day.isDayOff"
                      (change)="onWorkingDayOffChange(day.dayNumber, $any($event.target).checked)" />
                    <span class="sr-only">Day off</span>
                  </label>
                  <input
                    class="pf-editor-input"
                    type="time"
                    [value]="day.startTime"
                    (input)="patchWorkingDay(day.dayNumber, { startTime: $any($event.target).value })"
                    [disabled]="day.isDayOff" />
                  <input
                    class="pf-editor-input"
                    type="time"
                    [value]="day.endTime"
                    (input)="patchWorkingDay(day.dayNumber, { endTime: $any($event.target).value })"
                    [disabled]="day.isDayOff" />
                </div>
              }
            </div>
          </div>

          <label class="pf-editor-checkbox">
            <input type="checkbox" formControlName="isActive" />
            <span>Branch is active</span>
          </label>

          <label class="pf-editor-checkbox">
            <input type="checkbox" formControlName="isPrimaryBranch" [disabled]="true" />
            <span>Primary branch (default location)</span>
          </label>
        </form>
        <ng-container modalFooter>
          <button type="button" class="admin-section-action-btn admin-bookings-secondary-btn" (click)="cancelEdit()" [disabled]="state.branchSaving()">Cancel</button>
          <button type="button" class="admin-section-action-btn" (click)="save()" [disabled]="state.branchSaving() || !form.valid">
            {{ state.branchSaving() ? 'Saving…' : 'Save changes' }}
          </button>
        </ng-container>
      </app-admin-modal-shell>
    }
  `,
  styles: `
    .branch-working-days-table {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .branch-working-days-row {
      display: grid;
      grid-template-columns: minmax(5rem, 1.2fr) 3rem 1fr 1fr;
      align-items: center;
      gap: 0.5rem;
    }

    .branch-working-days-day {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .branch-working-days-off {
      display: flex;
      justify-content: center;
    }
  `
})
export class BranchFormSectionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly state = inject(AdminProfileStateService);
  private readonly countriesService = inject(CountriesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly sectionIcon = MapPin;
  readonly expanded = signal(!this.state.branchComplete());
  readonly editing = signal(false);
  private snapshot = '';

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    addressLine1: ['', Validators.maxLength(200)],
    addressLine2: ['', Validators.maxLength(200)],
    city: ['', Validators.maxLength(100)],
    countryCode: [''],
    postalCode: ['', Validators.maxLength(20)],
    latitude: [null as number | null],
    longitude: [null as number | null],
    phoneNumber: ['', Validators.maxLength(20)],
    email: ['', [Validators.maxLength(320), Validators.email]],
    workingDays: [createDefaultWorkingDaysFormValues()],
    isActive: [true],
    isPrimaryBranch: [{ value: true, disabled: true }]
  });

  constructor() {
    effect(() => {
      if (this.state.branch() && !this.editing()) {
        this.patchFromBranch();
      }
    });
  }

  ngOnInit(): void {
    this.countriesService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.state.branch()) {
            this.patchFromBranch();
          }
        },
        error: () => undefined
      });
  }

  workingDays(): BranchWorkingDayFormValue[] {
    return this.form.controls.workingDays.value ?? createDefaultWorkingDaysFormValues();
  }

  workingDayLabel(dayNumber: number): string {
    return WORKING_DAY_LABELS[dayNumber] ?? `Day ${dayNumber}`;
  }

  patchWorkingDay(dayNumber: number, patch: Partial<BranchWorkingDayFormValue>): void {
    const workingDays = this.workingDays().map((day) =>
      day.dayNumber === dayNumber ? { ...day, ...patch } : day
    );
    this.form.controls.workingDays.setValue(workingDays);
  }

  onWorkingDayOffChange(dayNumber: number, isDayOff: boolean): void {
    this.patchWorkingDay(dayNumber, {
      isDayOff,
      ...(isDayOff ? { startTime: '', endTime: '' } : { startTime: '09:00', endTime: '18:00' })
    });
  }

  displayValue(field: keyof Omit<BranchFormSnapshot, 'workingDays' | 'latitude' | 'longitude'>): string {
    const raw = this.form.getRawValue();
    const value = raw[field];
    return typeof value === 'string' ? value : '';
  }

  displayNumber(field: 'latitude' | 'longitude'): string {
    const value = this.form.getRawValue()[field];
    return value === null || value === undefined ? '' : String(value);
  }

  displayWorkingHours(): string {
    const branch = this.state.branch();
    if (branch?.workingDays?.length) {
      return formatBranchWorkingHoursSummary(branch.workingDays);
    }
    return formatBranchWorkingHoursSummary(formWorkingDaysToApi(this.workingDays()));
  }

  selectedCountryName(): string {
    const code =
      this.form.getRawValue().countryCode ||
      this.countriesService.resolveBranchCountryCode(readBranchCountryCode(this.state.branch()));
    if (!code) {
      return '';
    }
    return this.countriesService.findByIsoCode(code)?.name ?? code;
  }

  startEdit(): void {
    this.snapshot = JSON.stringify(this.form.getRawValue());
    this.editing.set(true);
    this.form.controls.countryCode.enable({ emitEvent: false });
  }

  cancelEdit(): void {
    if (this.snapshot) {
      const parsed = JSON.parse(this.snapshot) as BranchFormSnapshot;
      this.form.patchValue(parsed);
    } else {
      this.patchFromBranch();
    }
    this.editing.set(false);
    this.form.controls.countryCode.disable({ emitEvent: false });
  }

  save(): void {
    if (this.state.branchSaving()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const workingDaysError = validateWorkingDaysForm(this.workingDays());
    if (workingDaysError) {
      return;
    }

    const countryCode = this.form.controls.countryCode.value?.trim() || null;
    const raw = this.form.getRawValue();
    const payload: BranchUpdateRequest = {
      name: (raw.name ?? '').trim(),
      addressLine1: raw.addressLine1?.trim() || null,
      addressLine2: raw.addressLine2?.trim() || null,
      city: raw.city?.trim() || null,
      countryCode,
      postalCode: raw.postalCode?.trim() || null,
      latitude: raw.latitude ?? null,
      longitude: raw.longitude ?? null,
      phoneNumber: raw.phoneNumber?.trim() || null,
      email: raw.email?.trim() || null,
      workingDays: formWorkingDaysToApi(this.workingDays()),
      isActive: raw.isActive ?? true,
      isPrimaryBranch: true
    };
    this.state.saveBranch(payload).subscribe({
      next: () => {
        this.editing.set(false);
        this.form.controls.countryCode.disable({ emitEvent: false });
      }
    });
  }

  private patchFromBranch(): void {
    const branch = this.state.branch();
    if (!branch) return;

    const countryCode = this.countriesService.resolveBranchCountryCode(
      readBranchCountryCode(branch)
    );

    this.form.patchValue({
      name: branch.name ?? '',
      addressLine1: branch.addressLine1 ?? '',
      addressLine2: branch.addressLine2 ?? '',
      city: branch.city ?? '',
      countryCode,
      postalCode: branch.postalCode ?? '',
      latitude: branch.latitude ?? null,
      longitude: branch.longitude ?? null,
      phoneNumber: branch.phoneNumber ?? '',
      email: branch.email ?? '',
      workingDays: workingDaysToFormValues(branch.workingDays),
      isActive: branch.isActive ?? true,
      isPrimaryBranch: branch.isPrimaryBranch ?? true
    });
    if (!this.editing()) {
      this.form.controls.countryCode.disable({ emitEvent: false });
    }
  }
}
