import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CountriesService } from '@shared/data-access/countries.service';
import { PhoneNumberFieldComponent } from '@shared/ui/phone-number-field.component';
import { EMPTY_PHONE_NUMBER, PhoneNumberValue } from '@shared/models/phone-number.model';
import {
  displayPhoneValue,
  formatPhoneWithDialCode,
  parsePhoneNumberValue
} from '@shared/utils/phone.util';
import { Briefcase, Building2, FileText, Mail, Phone, UserRound, Globe, MapPin } from 'lucide-angular';
import { AdminFormSectionCardComponent } from '@features/admin/shared/admin-form-section-card.component';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { AdminDetailMediaComponent } from '@features/admin/shared/admin-detail-media.component';
import { MediaUploadZoneComponent } from '@shared/ui/media-upload-zone.component';
import { AdminProfileStateService } from '../data-access/admin-profile-state.service';
import { DocumentUploadService } from '../data-access/document-upload.service';
import { NotificationService } from '@core/notifications/notification.service';
import { BusinessTypesService } from '../data-access/business-types.service';
import { BusinessTypeDto } from '../models/business-type.model';
import {
  BusinessProfileUpdateRequest,
  getCoverPreviewUrl,
  getLogoPreviewUrl
} from '../models/business-profile.model';
import { FileCategory } from '@shared/files/file-category.enum';
import {
  buildUploadDocumentRequest,
  UploadDocumentRequest
} from '@shared/files/upload-document.model';

interface BusinessProfileFormSnapshot {
  form: {
    businessName: string;
    email: string;
    phone: PhoneNumberValue;
    businessTypeId: string;
    description: string;
    tagline: string;
    supportEmail: string;
    supportPhone: PhoneNumberValue;
    registrationNumber: string;
    taxId: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
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
    AdminDetailCardComponent,
    AdminDetailItemComponent,
    AdminDetailMediaComponent,
    MediaUploadZoneComponent,
    PhoneNumberFieldComponent
  ],
  template: `
    <app-admin-form-section-card
      title="Business Profile"
      subtitle="Complete company identity, branding, and contact information"
      [icon]="sectionIcon"
      [complete]="state.profileComplete()"
      [(expanded)]="expanded"
      [editing]="editing()"
      [saving]="state.profileSaving() || uploading()"
      [canSave]="form.valid"
      [lastSavedAt]="state.profileLastSavedAt()"
      (edit)="startEdit()"
      (save)="save()"
      (cancel)="cancelEdit()"
    >
      @if (!editing()) {
        <!-- Display View -->
        <div class="admin-detail-view admin-detail-view--rich">
          <!-- Media Section -->
          <div class="admin-detail-view__grid admin-detail-view__grid--2">
            <app-admin-detail-media
              label="Logo"
              variant="card"
              fit="contain"
              [url]="logoPreview()"
            />
            <app-admin-detail-media
              label="Cover Image"
              variant="card"
              fit="cover"
              [url]="coverPreview()"
            />
          </div>

          <!-- Core Business Information -->
          <div class="admin-detail-view__grid admin-detail-view__grid--2">
            <app-admin-detail-card>
              <app-admin-detail-item
                [icon]="businessNameIcon"
                label="Business Name"
                [value]="displayValue('businessName')"
                [divider]="true"
              />
              <app-admin-detail-item
                [icon]="businessTypeIcon"
                label="Business Type"
                [value]="selectedTypeName()"
                [divider]="true"
              />
              <app-admin-detail-item
                [icon]="globeIcon"
                label="Tagline"
                [value]="displayValue('tagline')"
              />
            </app-admin-detail-card>

            <!-- Contact Information -->
            <app-admin-detail-card>
              <app-admin-detail-item
                [icon]="emailIcon"
                label="Business Email"
                [value]="displayValue('email')"
                [divider]="true"
              />
              <app-admin-detail-item
                [icon]="phoneIcon"
                label="Business Phone"
                [value]="displayPhone()"
                [divider]="true"
              />
              <app-admin-detail-item
                [icon]="emailIcon"
                label="Support Email"
                [value]="displayValue('supportEmail')"
                [divider]="true"
              />
              <app-admin-detail-item
                [icon]="phoneIcon"
                label="Support Phone"
                [value]="displaySupportPhone()"
              />
            </app-admin-detail-card>
          </div>

          <!-- Legal Information -->
          <app-admin-detail-card [full]="true">
            <app-admin-detail-item
              label="Registration Number"
              [value]="displayValue('registrationNumber')"
              [divider]="true"
            />
            <app-admin-detail-item
              label="Tax ID"
              [value]="displayValue('taxId')"
            />
          </app-admin-detail-card>

          <!-- Address Information -->
          <app-admin-detail-card [full]="true">
            <app-admin-detail-item
              [icon]="addressIcon"
              label="Business Address"
              [value]="displayAddress()"
              [multiline]="true"
            />
          </app-admin-detail-card>

          <!-- Brand Description -->
          <app-admin-detail-card [full]="true">
            <app-admin-detail-item
              [icon]="descriptionIcon"
              label="Store Description"
              [value]="displayValue('description')"
              [multiline]="true"
            />
          </app-admin-detail-card>
        </div>
      } @else {
        <!-- Edit View -->
        <form class="pf-editor-fields" [formGroup]="form">
          <!-- Media Upload Section -->
          <div class="pf-editor-section">
            <h3 class="pf-editor-section-title">Branding</h3>
            <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
              <app-media-upload-zone
                label="Logo"
                [singleSlot]="true"
                [previewUrl]="logoPreview()"
                (fileSelected)="onLogoSelected($event.file, $event.dataUrl)"
                (cleared)="onLogoCleared()"
              />
              <app-media-upload-zone
                label="Cover Image"
                [singleSlot]="true"
                [previewUrl]="coverPreview()"
                (fileSelected)="onCoverSelected($event.file, $event.dataUrl)"
                (cleared)="onCoverCleared()"
              />
            </div>
          </div>

          <!-- Core Business Information -->
          <div class="pf-editor-section">
            <h3 class="pf-editor-section-title">Core Business Information</h3>

            <div class="pf-editor-field">
              <span class="pf-editor-label">Business Name <span class="text-rose-500">*</span></span>
              <input class="pf-editor-input" formControlName="businessName" placeholder="Your company name" />
              @if (form.controls.businessName.touched && form.controls.businessName.invalid) {
                <p class="pf-editor-error">Business name is required (max 200 characters).</p>
              }
            </div>

            <div class="pf-editor-field">
              <span class="pf-editor-label">Business Type <span class="text-rose-500">*</span></span>
              <select class="pf-editor-input" formControlName="businessTypeId">
                <option value="">Select type</option>
                @for (type of businessTypes(); track type.id) {
                  <option [value]="type.id">{{ type.name }}</option>
                }
              </select>
              @if (form.controls.businessTypeId.touched && form.controls.businessTypeId.invalid) {
                <p class="pf-editor-error">Business type is required.</p>
              }
            </div>

            <div class="pf-editor-field">
              <span class="pf-editor-label">Tagline</span>
              <input class="pf-editor-input" formControlName="tagline" placeholder="Short brand tagline for homepage" />
              @if (form.controls.tagline.touched && form.controls.tagline.invalid) {
                <p class="pf-editor-error">Max 200 characters.</p>
              }
            </div>
          </div>

          <!-- Contact Information -->
          <div class="pf-editor-section">
            <h3 class="pf-editor-section-title">Contact Information</h3>

            <div class="pf-editor-field">
              <span class="pf-editor-label">Business Email</span>
              <input class="pf-editor-input" type="email" formControlName="email" placeholder="business@example.com" />
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <p class="pf-editor-error">Enter a valid email address.</p>
              }
            </div>

            <app-phone-number-field formControlName="phone" />

            <div class="pf-editor-field">
              <span class="pf-editor-label">Support Email</span>
              <input class="pf-editor-input" type="email" formControlName="supportEmail" placeholder="support@example.com" />
              @if (form.controls.supportEmail.touched && form.controls.supportEmail.invalid) {
                <p class="pf-editor-error">Enter a valid email address.</p>
              }
            </div>

            <app-phone-number-field formControlName="supportPhone" />
          </div>

          <!-- Legal & Registration -->
          <div class="pf-editor-section">
            <h3 class="pf-editor-section-title">Legal & Registration</h3>

            <div class="pf-editor-field">
              <span class="pf-editor-label">Business Registration Number</span>
              <input class="pf-editor-input" formControlName="registrationNumber" placeholder="e.g., CIN or registration number" />
              @if (form.controls.registrationNumber.touched && form.controls.registrationNumber.invalid) {
                <p class="pf-editor-error">Max 100 characters.</p>
              }
            </div>

            <div class="pf-editor-field">
              <span class="pf-editor-label">Tax ID</span>
              <input class="pf-editor-input" formControlName="taxId" placeholder="e.g., GST/VAT/Tax ID" />
              @if (form.controls.taxId.touched && form.controls.taxId.invalid) {
                <p class="pf-editor-error">Max 50 characters.</p>
              }
            </div>
          </div>

          <!-- Physical Address -->
          <div class="pf-editor-section">
            <h3 class="pf-editor-section-title">Business Address</h3>

            <div class="pf-editor-field">
              <span class="pf-editor-label">Street Address</span>
              <input class="pf-editor-input" formControlName="street" placeholder="Street address" />
              @if (form.controls.street.touched && form.controls.street.invalid) {
                <p class="pf-editor-error">Max 255 characters.</p>
              }
            </div>

            <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
              <div class="pf-editor-field">
                <span class="pf-editor-label">City</span>
                <input class="pf-editor-input" formControlName="city" placeholder="City" />
                @if (form.controls.city.touched && form.controls.city.invalid) {
                  <p class="pf-editor-error">Max 100 characters.</p>
                }
              </div>
              <div class="pf-editor-field">
                <span class="pf-editor-label">State/Province</span>
                <input class="pf-editor-input" formControlName="state" placeholder="State or province" />
                @if (form.controls.state.touched && form.controls.state.invalid) {
                  <p class="pf-editor-error">Max 100 characters.</p>
                }
              </div>
            </div>

            <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
              <div class="pf-editor-field">
                <span class="pf-editor-label">ZIP/Postal Code</span>
                <input class="pf-editor-input" formControlName="zipCode" placeholder="ZIP or postal code" />
                @if (form.controls.zipCode.touched && form.controls.zipCode.invalid) {
                  <p class="pf-editor-error">Max 20 characters.</p>
                }
              </div>
              <div class="pf-editor-field">
                <span class="pf-editor-label">Country</span>
                <input class="pf-editor-input" formControlName="country" placeholder="Country" />
                @if (form.controls.country.touched && form.controls.country.invalid) {
                  <p class="pf-editor-error">Max 100 characters.</p>
                }
              </div>
            </div>
          </div>

          <!-- Store Description -->
          <div class="pf-editor-section">
            <h3 class="pf-editor-section-title">Store Description</h3>

            <div class="pf-editor-field">
              <span class="pf-editor-label">Store Description</span>
              <textarea class="pf-editor-input pf-editor-textarea" formControlName="description" placeholder="Detailed description of your store and products" rows="4"></textarea>
              @if (form.controls.description.touched && form.controls.description.invalid) {
                <p class="pf-editor-error">Max 2000 characters.</p>
              }
            </div>
          </div>
        </form>
      }
    </app-admin-form-section-card>
  `
})
export class BusinessProfileFormSectionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly state = inject(AdminProfileStateService);
  private readonly documentUpload = inject(DocumentUploadService);
  private readonly businessTypesService = inject(BusinessTypesService);
  private readonly countriesService = inject(CountriesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notifications = inject(NotificationService);

  readonly sectionIcon = Building2;
  readonly businessNameIcon = UserRound;
  readonly emailIcon = Mail;
  readonly phoneIcon = Phone;
  readonly businessTypeIcon = Briefcase;
  readonly descriptionIcon = FileText;
  readonly globeIcon = Globe;
  readonly addressIcon = MapPin;
  readonly expanded = signal(false);
  readonly editing = signal(false);
  readonly uploading = signal(false);
  readonly businessTypes = signal<BusinessTypeDto[]>([]);
  readonly logoPreview = signal('');
  readonly coverPreview = signal('');

  private logoDocumentId: string | null = null;
  private coverDocumentId: string | null = null;
  private pendingLogoFile: File | null = null;
  private pendingCoverFile: File | null = null;
  private snapshot = '';

  readonly form = this.fb.nonNullable.group({
    // Core Business Identity
    businessName: ['', [Validators.required, Validators.maxLength(200)]],
    businessTypeId: ['', Validators.required],

    // Contact Information
    email: ['', [Validators.maxLength(320), Validators.email]],
    phone: [{ ...EMPTY_PHONE_NUMBER }],
    supportEmail: ['', [Validators.maxLength(320), Validators.email]],
    supportPhone: [{ ...EMPTY_PHONE_NUMBER }],

    // Brand & Storefront
    tagline: ['', Validators.maxLength(200)],
    description: ['', Validators.maxLength(2000)],

    // Legal & Registration
    registrationNumber: ['', Validators.maxLength(100)],
    taxId: ['', Validators.maxLength(50)],

    // Physical Address
    street: ['', Validators.maxLength(255)],
    city: ['', Validators.maxLength(100)],
    state: ['', Validators.maxLength(100)],
    zipCode: ['', Validators.maxLength(20)],
    country: ['', Validators.maxLength(100)]
  });

  constructor() {
    effect(() => {
      if (this.state.profile() && this.businessTypes().length > 0 && !this.editing()) {
        this.patchFromProfile();
      }
    });
  }

  ngOnInit(): void {
    this.syncSelectEnableState();
    this.countriesService.load();

    this.countriesService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.state.profile()) {
            this.patchPhoneFieldsFromProfile();
          }
        },
        error: (err) => this.notifications.errorFromApi(err, 'Could not load countries.')
      });

    this.businessTypesService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (types) => {
        this.businessTypes.set(types);
        if (this.state.profile() && !this.editing()) {
          this.patchFromProfile();
        }
        this.syncSelectEnableState();
      },
      error: (err) => this.notifications.errorFromApi(err, 'Could not load business types.')
    });
  }

  displayValue(
    field: Exclude<keyof BusinessProfileFormSnapshot['form'], 'phone' | 'supportPhone'>
  ): string {
    return this.form.getRawValue()[field] ?? '';
  }

  displayPhone(): string {
    const formatted = formatPhoneWithDialCode(this.form.getRawValue().phone);
    return displayPhoneValue(formatted ?? this.state.profile()?.phone);
  }

  displaySupportPhone(): string {
    const formatted = formatPhoneWithDialCode(this.form.getRawValue().supportPhone);
    return displayPhoneValue(formatted);
  }

  selectedTypeName(): string {
    const typeId = this.form.getRawValue().businessTypeId;
    return this.businessTypes().find((t) => t.id === typeId)?.name ?? '';
  }

  displayAddress(): string {
    const raw = this.form.getRawValue();
    const parts = [raw.street, raw.city, raw.state, raw.zipCode, raw.country]
      .filter((v) => v && v.trim());
    return parts.length > 0 ? parts.join(', ') : '—';
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
        // Core Business Identity
        businessName: raw.businessName.trim(),
        businessTypeId: raw.businessTypeId?.trim() ?? '',

        // Contact Information
        email: raw.email.trim() || null,
        phone: formatPhoneWithDialCode(raw.phone),
        supportEmail: raw.supportEmail.trim() || null,
        supportPhone: formatPhoneWithDialCode(raw.supportPhone),

        // Brand & Storefront
        tagline: raw.tagline.trim() || null,
        description: raw.description.trim() || null,

        // Legal & Registration
        registrationNumber: raw.registrationNumber.trim() || null,
        taxId: raw.taxId.trim() || null,

        // Physical Address
        street: raw.street.trim() || null,
        city: raw.city.trim() || null,
        state: raw.state.trim() || null,
        zipCode: raw.zipCode.trim() || null,
        country: raw.country.trim() || null,

        // Media
        logoDocumentId: this.logoDocumentId,
        coverImageDocumentId: this.coverDocumentId,

        // Retained from profile
        websiteUrl: this.state.profile()?.websiteUrl ?? null,
        timeZone: this.state.profile()?.timeZone ?? null,
        currency: this.state.profile()?.currency ?? null,
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

  private syncSelectEnableState(): void {
    if (!this.editing()) {
      this.form.controls.businessTypeId.disable({ emitEvent: false });
      this.form.controls.phone.disable({ emitEvent: false });
      this.form.controls.supportPhone.disable({ emitEvent: false });
      return;
    }
    this.form.controls.businessTypeId.enable({ emitEvent: false });
    this.form.controls.phone.enable({ emitEvent: false });
    this.form.controls.supportPhone.enable({ emitEvent: false });
  }

  private patchPhoneFieldsFromProfile(): void {
    const profile = this.state.profile();
    if (!profile) {
      return;
    }
    this.form.patchValue(
      {
        phone: parsePhoneNumberValue(profile.phone, this.countriesService.countries()),
        supportPhone: parsePhoneNumberValue(profile.supportPhone, this.countriesService.countries())
      },
      { emitEvent: false }
    );
    this.form.controls.phone.updateValueAndValidity({ emitEvent: false });
    this.form.controls.supportPhone.updateValueAndValidity({ emitEvent: false });
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
    this.deleteStoredDocument(this.logoDocumentId);
    this.pendingLogoFile = null;
    this.logoDocumentId = null;
    this.logoPreview.set('');
  }

  onCoverCleared(): void {
    this.deleteStoredDocument(this.coverDocumentId);
    this.pendingCoverFile = null;
    this.coverDocumentId = null;
    this.coverPreview.set('');
  }

  private deleteStoredDocument(documentId: string | null | undefined): void {
    const id = documentId?.trim();
    if (!id) {
      return;
    }
    this.documentUpload.delete(id).subscribe({
      error: () => undefined
    });
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

    this.form.patchValue({
      // Core Business Identity
      businessName: profile.businessName ?? '',
      businessTypeId: typeId,

      // Contact Information
      email: profile.email ?? '',
      supportEmail: profile.supportEmail ?? '',

      // Brand & Storefront
      tagline: profile.tagline ?? '',
      description: profile.description ?? '',

      // Legal & Registration
      registrationNumber: profile.registrationNumber ?? '',
      taxId: profile.taxId ?? '',

      // Physical Address
      street: profile.street ?? '',
      city: profile.city ?? '',
      state: profile.state ?? '',
      zipCode: profile.zipCode ?? '',
      country: profile.country ?? ''
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
