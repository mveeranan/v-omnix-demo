import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CountriesService } from '../../../shared/data-access/countries.service';
import { PhoneNumberFieldComponent } from '../../../shared/ui/phone-number-field.component';
import { EMPTY_PHONE_NUMBER, PhoneNumberValue } from '../../../shared/models/phone-number.model';
import {
  displayPhoneValue,
  formatPhoneWithDialCode,
  parsePhoneNumberValue
} from '../../../shared/utils/phone.util';
import { Building2 } from 'lucide-angular';
import { AdminFormSectionCardComponent } from '../shared/admin-form-section-card.component';
import { AdminModalShellComponent } from '../shared/admin-modal-shell.component';
import { AdminDetailFieldComponent } from '../shared/admin-detail-field.component';
import { AdminDetailMediaComponent } from '../shared/admin-detail-media.component';
import { MediaUploadZoneComponent } from '../../../shared/ui/media-upload-zone.component';
import { AdminProfileStateService } from '../data-access/admin-profile-state.service';
import { BusinessTypesService } from '../data-access/business-types.service';
import { BusinessGroupDto } from '../models/business-type.model';
import {
  BusinessProfileUpdateRequest,
  getCoverPreviewUrl,
  getLogoPreviewUrl
} from '../models/business-profile.model';
import { FileCategory } from '../../../shared/files/file-category.enum';
import {
  buildUploadDocumentRequest,
  UploadDocumentRequest
} from '../../../shared/files/upload-document.model';

interface BusinessProfileFormSnapshot {
  form: {
    businessName: string;
    email: string;
    phone: PhoneNumberValue;
    businessGroupId: string;
    businessTypeId: string;
    description: string;
    websiteUrl: string;
    timeZone: string;
    currency: string;
  };
  logoDocumentId: string | null;
  coverDocumentId: string | null;
}

@Component({
  selector: 'app-business-profile-form-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AdminFormSectionCardComponent,
    AdminDetailFieldComponent,
    AdminDetailMediaComponent,
    MediaUploadZoneComponent,
    PhoneNumberFieldComponent,
    AdminModalShellComponent
  ],
  template: `
    <app-admin-form-section-card
      title="Business profile"
      subtitle="Company identity"
      [icon]="sectionIcon"
      [complete]="state.profileComplete()"
      [(expanded)]="expanded"
      [editing]="false"
      [lastSavedAt]="state.profileLastSavedAt()"
      (edit)="startEdit()"
    >
      <div class="admin-detail-view">
          <div class="admin-detail-view__grid admin-detail-view__grid--2">
            <app-admin-detail-media label="Logo" [url]="logoPreview()" />
            <app-admin-detail-media label="Cover image" [url]="coverPreview()" />
          </div>

          <app-admin-detail-field label="Business name" [value]="displayValue('businessName')" />
          <div class="admin-detail-view__grid admin-detail-view__grid--2">
            <app-admin-detail-field label="Email" [value]="displayValue('email')" />
            <app-admin-detail-field label="Phone" [value]="displayPhone()" />
          </div>
          <div class="admin-detail-view__grid admin-detail-view__grid--2">
            <app-admin-detail-field label="Business group" [value]="selectedGroupName()" />
            <app-admin-detail-field label="Business type" [value]="selectedTypeName()" />
          </div>
          <app-admin-detail-field label="Description" [value]="displayValue('description')" />
          <div class="admin-detail-view__grid admin-detail-view__grid--2">
            <app-admin-detail-field label="Website" [value]="displayValue('websiteUrl')" />
            <app-admin-detail-field label="Currency" [value]="displayValue('currency')" />
          </div>
          <app-admin-detail-field label="Time zone" [value]="displayValue('timeZone')" />
        </div>
    </app-admin-form-section-card>

    @if (editing()) {
      <app-admin-modal-shell
        [open]="true"
        title="Edit business profile"
        subtitle="Update your company identity and contact details."
        panelClass="admin-modal-panel--xl"
        [disableClose]="state.profileSaving() || uploading()"
        (close)="cancelEdit()">
        <form class="pf-editor-fields" [formGroup]="form">
          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            <app-media-upload-zone
              label="Logo"
              [singleSlot]="true"
              [previewUrl]="logoPreview()"
              (fileSelected)="onLogoSelected($event.file, $event.dataUrl)"
              (cleared)="onLogoCleared()"
            />
            <app-media-upload-zone
              label="Cover image"
              [singleSlot]="true"
              [previewUrl]="coverPreview()"
              (fileSelected)="onCoverSelected($event.file, $event.dataUrl)"
              (cleared)="onCoverCleared()"
            />
          </div>

          <div class="pf-editor-field">
            <span class="pf-editor-label">Business name <span class="text-rose-500">*</span></span>
            <input class="pf-editor-input" formControlName="businessName" />
            @if (form.controls.businessName.touched && form.controls.businessName.invalid) {
              <p class="pf-editor-error">Business name is required (max 200 characters).</p>
            }
          </div>

          <div class="pf-editor-field">
            <span class="pf-editor-label">Email</span>
            <input class="pf-editor-input" type="email" formControlName="email" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <p class="pf-editor-error">Enter a valid email address.</p>
            }
          </div>

          <app-phone-number-field formControlName="phone" />

          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            <div class="pf-editor-field">
              <span class="pf-editor-label">Business group <span class="text-rose-500">*</span></span>
              <select class="pf-editor-input" formControlName="businessGroupId" (change)="onGroupChange()">
                <option value="">Select group</option>
                @for (group of businessGroups(); track group.groupId) {
                  <option [value]="group.groupId">{{ group.groupName }}</option>
                }
              </select>
              @if (form.controls.businessGroupId.touched && form.controls.businessGroupId.invalid) {
                <p class="pf-editor-error">Business group is required.</p>
              }
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Business type <span class="text-rose-500">*</span></span>
              <select class="pf-editor-input" formControlName="businessTypeId">
                <option value="">Select type</option>
                @for (type of filteredTypes(); track type.id) {
                  <option [value]="type.id">{{ type.name }}</option>
                }
              </select>
              @if (form.controls.businessTypeId.touched && form.controls.businessTypeId.invalid) {
                <p class="pf-editor-error">Business type is required.</p>
              }
            </div>
          </div>

          <div class="pf-editor-field">
            <span class="pf-editor-label">Description</span>
            <textarea class="pf-editor-input pf-editor-textarea" formControlName="description" rows="4"></textarea>
          </div>

          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            <div class="pf-editor-field">
              <span class="pf-editor-label">Website</span>
              <input class="pf-editor-input" formControlName="websiteUrl" />
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Currency</span>
              <input class="pf-editor-input" formControlName="currency" maxlength="10" />
            </div>
          </div>

          <div class="pf-editor-field">
            <span class="pf-editor-label">Time zone</span>
            <input class="pf-editor-input" formControlName="timeZone" />
          </div>
        </form>
        <ng-container modalFooter>
          <button type="button" class="admin-section-action-btn admin-bookings-secondary-btn" (click)="cancelEdit()" [disabled]="state.profileSaving() || uploading()">Cancel</button>
          <button type="button" class="admin-section-action-btn" (click)="save()" [disabled]="state.profileSaving() || uploading() || !form.valid">
            {{ state.profileSaving() ? 'Saving…' : 'Save changes' }}
          </button>
        </ng-container>
      </app-admin-modal-shell>
    }
  `
})
export class BusinessProfileFormSectionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly state = inject(AdminProfileStateService);
  private readonly businessTypesService = inject(BusinessTypesService);
  private readonly countriesService = inject(CountriesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly sectionIcon = Building2;
  readonly expanded = signal(!this.state.profileComplete());
  readonly editing = signal(false);
  readonly uploading = signal(false);
  readonly businessGroups = signal<BusinessGroupDto[]>([]);
  readonly logoPreview = signal('');
  readonly coverPreview = signal('');

  private logoDocumentId: string | null = null;
  private coverDocumentId: string | null = null;
  private pendingLogoFile: File | null = null;
  private pendingCoverFile: File | null = null;
  private snapshot = '';

  readonly form = this.fb.nonNullable.group({
    businessName: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.maxLength(320), Validators.email]],
    phone: [{ ...EMPTY_PHONE_NUMBER }],
    businessGroupId: ['', Validators.required],
    businessTypeId: ['', Validators.required],
    description: ['', Validators.maxLength(2000)],
    websiteUrl: ['', Validators.maxLength(500)],
    timeZone: ['', Validators.maxLength(100)],
    currency: ['', Validators.maxLength(10)]
  });

  constructor() {
    effect(() => {
      if (this.state.profile() && this.businessGroups().length > 0 && !this.editing()) {
        this.patchFromProfile();
      }
    });
  }

  ngOnInit(): void {
    this.syncSelectEnableState();
    this.countriesService.load();

    this.form.controls.businessGroupId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onGroupChange());

    this.countriesService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.state.profile()) {
            this.patchPhoneFieldsFromProfile();
          }
        },
        error: () => undefined
      });

    this.businessTypesService.listGroups().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (groups) => {
        this.businessGroups.set(groups);
        if (this.state.profile() && !this.editing()) {
          this.patchFromProfile();
        }
        this.syncSelectEnableState();
      },
      error: () => undefined
    });
  }

  filteredTypes() {
    const groupId = this.form.controls.businessGroupId.value;
    return this.businessGroups().find((g) => g.groupId === groupId)?.types ?? [];
  }

  displayValue(
    field: Exclude<keyof BusinessProfileFormSnapshot['form'], 'phone'>
  ): string {
    return this.form.getRawValue()[field] ?? '';
  }

  displayPhone(): string {
    const formatted = formatPhoneWithDialCode(this.form.getRawValue().phone);
    return displayPhoneValue(formatted ?? this.state.profile()?.phone);
  }

  selectedGroupName(): string {
    const groupId = this.form.getRawValue().businessGroupId;
    return this.businessGroups().find((g) => g.groupId === groupId)?.groupName ?? '';
  }

  selectedTypeName(): string {
    const typeId = this.form.getRawValue().businessTypeId;
    const groupId = this.form.getRawValue().businessGroupId;
    const types = this.businessGroups().find((g) => g.groupId === groupId)?.types ?? [];
    return types.find((t) => t.id === typeId)?.name ?? '';
  }

  startEdit(): void {
    this.snapshot = JSON.stringify({
      form: this.form.getRawValue(),
      logoDocumentId: this.logoDocumentId,
      coverDocumentId: this.coverDocumentId
    });
    this.editing.set(true);
    this.syncSelectEnableState();
  }

  cancelEdit(): void {
    if (this.snapshot) {
      const parsed = JSON.parse(this.snapshot) as BusinessProfileFormSnapshot;
      this.form.patchValue(parsed.form);
      this.logoDocumentId = parsed.logoDocumentId;
      this.coverDocumentId = parsed.coverDocumentId;
    } else {
      this.patchFromProfile();
    }
    this.pendingLogoFile = null;
    this.pendingCoverFile = null;
    this.restoreMediaFromProfile();
    this.editing.set(false);
    this.syncSelectEnableState();
  }

  save(): void {
    if (this.state.profileSaving() || this.uploading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.uploading.set(true);
    const raw = this.form.getRawValue();
    void this.buildAttachments().then((attachments) => {
      const payload: BusinessProfileUpdateRequest = {
        businessName: raw.businessName.trim(),
        email: raw.email.trim() || null,
        phone: formatPhoneWithDialCode(raw.phone),
        businessTypeId: raw.businessTypeId?.trim() ?? '',
        description: raw.description.trim() || null,
        logoDocumentId: this.logoDocumentId,
        coverImageDocumentId: this.coverDocumentId,
        websiteUrl: raw.websiteUrl.trim() || null,
        timeZone: raw.timeZone.trim() || null,
        currency: raw.currency.trim() || null,
        ...(attachments.length > 0 ? { attachments } : {})
      };

      this.state
        .saveProfile(payload)
        .pipe(finalize(() => this.uploading.set(false)))
        .subscribe({
          next: (updated) => {
            this.pendingLogoFile = null;
            this.pendingCoverFile = null;
            this.logoDocumentId = updated.logoDocumentId ?? null;
            this.coverDocumentId = updated.coverImageDocumentId ?? null;
            this.restoreMediaFromProfile();
            this.editing.set(false);
            this.syncSelectEnableState();
          }
        });
    }).catch(() => {
      this.uploading.set(false);
    });
  }

  onGroupChange(): void {
    const currentType = this.form.controls.businessTypeId.value;
    const types = this.filteredTypes();
    if (!types.some((t) => t.id === currentType)) {
      this.form.controls.businessTypeId.setValue('', { emitEvent: false });
    }
    this.syncSelectEnableState();
  }

  private syncSelectEnableState(): void {
    if (!this.editing()) {
      this.form.controls.businessGroupId.disable({ emitEvent: false });
      this.form.controls.businessTypeId.disable({ emitEvent: false });
      this.form.controls.phone.disable({ emitEvent: false });
      return;
    }
    this.form.controls.businessGroupId.enable({ emitEvent: false });
    this.form.controls.phone.enable({ emitEvent: false });
    if (this.form.controls.businessGroupId.value) {
      this.form.controls.businessTypeId.enable({ emitEvent: false });
    } else {
      this.form.controls.businessTypeId.disable({ emitEvent: false });
    }
  }

  private patchPhoneFieldsFromProfile(): void {
    const profile = this.state.profile();
    if (!profile) {
      return;
    }
    this.form.patchValue(
      {
        phone: parsePhoneNumberValue(profile.phone, this.countriesService.countries())
      },
      { emitEvent: false }
    );
    this.form.controls.phone.updateValueAndValidity({ emitEvent: false });
  }

  onLogoSelected(file: File, dataUrl: string): void {
    this.pendingLogoFile = file;
    this.logoPreview.set(dataUrl);
  }

  onCoverSelected(file: File, dataUrl: string): void {
    this.pendingCoverFile = file;
    this.coverPreview.set(dataUrl);
  }

  onLogoCleared(): void {
    this.pendingLogoFile = null;
    this.logoDocumentId = null;
    this.logoPreview.set('');
  }

  onCoverCleared(): void {
    this.pendingCoverFile = null;
    this.coverDocumentId = null;
    this.coverPreview.set('');
  }

  private async buildAttachments(): Promise<UploadDocumentRequest[]> {
    const attachments: UploadDocumentRequest[] = [];

    if (this.pendingLogoFile) {
      attachments.push(
        await buildUploadDocumentRequest(this.pendingLogoFile, FileCategory.BusinessLogo)
      );
    }

    if (this.pendingCoverFile) {
      attachments.push(
        await buildUploadDocumentRequest(this.pendingCoverFile, FileCategory.BannerImage)
      );
    }

    return attachments;
  }

  private patchFromProfile(): void {
    const profile = this.state.profile();
    if (!profile) return;

    const typeId = (profile.businessTypeId ?? '').trim();
    const groupId =
      this.businessGroups().find((g) => g.types.some((t) => t.id === typeId))?.groupId ?? '';

    this.form.patchValue({
      businessName: profile.businessName ?? '',
      email: profile.email ?? '',
      businessGroupId: groupId,
      businessTypeId: typeId,
      description: profile.description ?? '',
      websiteUrl: profile.websiteUrl ?? '',
      timeZone: profile.timeZone ?? '',
      currency: profile.currency ?? ''
    });

    this.logoDocumentId = profile.logoDocumentId ?? null;
    this.coverDocumentId = profile.coverImageDocumentId ?? null;
    this.pendingLogoFile = null;
    this.pendingCoverFile = null;
    this.patchPhoneFieldsFromProfile();
    this.restoreMediaFromProfile();
    this.syncSelectEnableState();
  }

  private restoreMediaFromProfile(): void {
    const profile = this.state.profile();
    this.logoPreview.set(getLogoPreviewUrl(profile));
    this.coverPreview.set(getCoverPreviewUrl(profile));
  }
}
