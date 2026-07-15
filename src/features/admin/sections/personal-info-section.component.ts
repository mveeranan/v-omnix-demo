import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Mail, Phone, UserRound } from 'lucide-angular';
import { NotificationService } from '@core/notifications/notification.service';
import { CountriesService } from '@shared/data-access/countries.service';
import { PhoneNumberFieldComponent } from '@shared/ui/phone-number-field.component';
import { EMPTY_PHONE_NUMBER, PhoneNumberValue } from '@shared/models/phone-number.model';
import {
  displayPhoneValue,
  formatPhoneForApi,
  formatPhoneWithDialCode,
  parsePhoneNumberValue
} from '@shared/utils/phone.util';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { AdminDetailMediaComponent } from '@features/admin/shared/admin-detail-media.component';
import { AdminFormSectionCardComponent } from '@features/admin/shared/admin-form-section-card.component';
import { MediaUploadZoneComponent } from '@shared/ui/media-upload-zone.component';

import { AdminUserStateService } from '../data-access/admin-user-state.service';
import { DocumentUploadService } from '../data-access/document-upload.service';

import {

  buildProfileImagePayload,

  buildProfileImagePayloadFromDataUrl,

  getUserProfileImageUrl

} from '../models/user.model';

import { isDataUrl } from '@shared/files/upload-document.model';



@Component({

  selector: 'app-personal-info-section',

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

      title="Personal Info"

      subtitle="Account details"

      [icon]="sectionIcon"

      [complete]="isComplete()"

      [(expanded)]="expanded"

      [editing]="editing()"

      [saving]="state.saving()"

      [canSave]="form.valid && !!state.user()?.id"

      [lastSavedAt]="state.lastSavedAt()"

      (edit)="startEdit()"

      (save)="save()"

      (cancel)="cancelEdit()"

    >

      @if (state.loading()) {

        <div class="personal-loading">Loading personal info…</div>

      } @else if (state.loadError() && !state.user()) {

        <p class="personal-error">{{ state.loadError() }}</p>

      } @else if (!editing()) {
        <div class="admin-detail-view admin-detail-view--rich personal-info-detail">
          <div class="personal-info-detail__layout">
            <div class="personal-info-detail__media">
              <app-admin-detail-media
                label="Profile Image"
                variant="card"
                fit="cover"
                [url]="profileImageUrl()"
              />
            </div>

            <div class="personal-info-detail__fields">
              <div class="admin-detail-view__grid admin-detail-view__grid--2">
                <app-admin-detail-card>
                  <app-admin-detail-item
                    [icon]="firstNameIcon"
                    label="First Name"
                    [value]="firstName()"
                  />
                </app-admin-detail-card>
                <app-admin-detail-card>
                  <app-admin-detail-item
                    [icon]="lastNameIcon"
                    label="Last Name"
                    [value]="lastName()"
                  />
                </app-admin-detail-card>
              </div>

              <div class="admin-detail-view__grid admin-detail-view__grid--2">
                <app-admin-detail-card>
                  <app-admin-detail-item
                    [icon]="emailIcon"
                    label="Email"
                    [value]="email()"
                  />
                </app-admin-detail-card>
                <app-admin-detail-card>
                  <app-admin-detail-item
                    [icon]="phoneIcon"
                    label="Mobile Number"
                    [value]="displayMobile()"
                  />
                </app-admin-detail-card>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <form class="pf-editor-fields personal-form" [formGroup]="form">
          <div class="personal-grid">
            <div class="personal-media personal-media--edit">
              <div class="personal-media__frame">
                <app-media-upload-zone
                  label="Profile image"
                  [singleSlot]="true"
                  [previewUrl]="profileImageDraft()"
                  (fileSelected)="onProfileImageSelected($event)"
                  (cleared)="onProfileImageCleared()"
                />
              </div>
            </div>
            <div class="personal-details">
              <div class="personal-details__names">
                <div class="pf-editor-field">
                  <span class="pf-editor-label">First name</span>
                  <input class="pf-editor-input" formControlName="firstName" />
                </div>
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Last name</span>
                  <input class="pf-editor-input" formControlName="lastName" />
                </div>
              </div>
              <app-phone-number-field
                formControlName="phone"
                layout="stacked"
                countryCodeLabel="Country code"
                phoneLabel="Mobile number"
              />
              <div class="pf-editor-field">
                <span class="pf-editor-label">Email</span>
                <input class="pf-editor-input" type="email" formControlName="email" />
              </div>
            </div>
          </div>
        </form>
      }

    </app-admin-form-section-card>

  `,

  styles: `

    .personal-loading,

    .personal-error {

      font-size: 0.875rem;

      color: rgb(100 116 139);

    }



    .personal-error {

      color: rgb(220 38 38);

    }

    .personal-info-detail.admin-detail-view--rich {
      gap: 0;
    }

    .personal-info-detail__layout {
      display: grid;
      grid-template-columns: minmax(0, 11rem) minmax(0, 1fr);
      gap: 0.75rem;
      align-items: start;
    }

    .personal-info-detail__media {
      width: 100%;
      max-width: 11rem;
    }

    .personal-info-detail__media ::ng-deep .admin-detail-media__frame,
    .personal-info-detail__media ::ng-deep .admin-detail-media__empty {
      height: 10.5rem;
    }

    .personal-info-detail__media ::ng-deep .admin-detail-media__frame > img {
      object-fit: cover;
      object-position: center;
    }

    .personal-info-detail__fields {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-width: 0;
    }

    .personal-info-detail__fields > .admin-detail-view__grid {
      gap: 0.75rem;
    }

    .personal-info-detail__fields ::ng-deep .admin-detail-card {
      gap: 0;
    }

    .personal-info-detail__fields ::ng-deep .admin-detail-item {
      align-items: flex-start;
    }

    .personal-info-detail__fields ::ng-deep .admin-detail-item__content {
      padding-top: 0.125rem;
    }

    @media (max-width: 639px) {
      .personal-info-detail__layout {
        grid-template-columns: minmax(0, 1fr);
        justify-items: center;
      }

      .personal-info-detail__media {
        max-width: 9rem;
      }

      .personal-info-detail__media ::ng-deep .admin-detail-media__frame,
      .personal-info-detail__media ::ng-deep .admin-detail-media__empty {
        height: 9rem;
      }

      .personal-info-detail__fields {
        width: 100%;
      }
    }

    .personal-form.pf-editor-fields {
      gap: 0;
    }

    .personal-grid {
      display: grid;
      grid-template-columns: minmax(0, 11rem) minmax(0, 1fr);
      gap: 1.25rem 1.5rem;
      align-items: start;
    }

    .personal-grid--view {
      align-items: stretch;
    }

    .personal-grid--view .personal-media--view {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .personal-grid--view .personal-details {
      justify-content: center;
    }

    .personal-media__frame {
      width: min(100%, 11rem);
      aspect-ratio: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .personal-media {
      min-width: 0;
      display: flex;
      justify-content: center;
    }

    .personal-details__contact {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.875rem 1rem;
    }

    .personal-details {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
      min-width: 0;
    }

    .personal-details__names {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.875rem 1rem;
    }

    .personal-media--view .personal-media__frame ::ng-deep :is(.admin-detail-media-host, .space-y-2) {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }

    .personal-media--view .personal-media__frame ::ng-deep .admin-detail-media__preview {
      flex: 1;
      min-height: 0;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgb(15 23 42 / 0.04);
    }

  :host-context(.dark) .personal-media--view .personal-media__frame ::ng-deep .admin-detail-media__preview {
      background: rgb(255 255 255 / 0.04);
    }

    .personal-media--view .personal-media__frame ::ng-deep .admin-detail-media__preview img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
    }

    .personal-media--view .personal-media__frame ::ng-deep .admin-detail-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      border-radius: 0.75rem;
      border: 1px dashed rgb(203 213 225);
      background: rgb(248 250 252);
      color: rgb(100 116 139);
      font-size: 0.875rem;
    }

  :host-context(.dark) .personal-media--view .personal-media__frame ::ng-deep .admin-detail-empty {
      border-color: rgb(63 63 70);
      background: rgb(39 39 42);
      color: rgb(161 161 170);
    }

    .personal-media--edit .personal-media__frame app-media-upload-zone {
      display: flex;
      flex: 1;
      min-height: 0;
      height: 100%;
    }

    .personal-media--edit .personal-media__frame ::ng-deep .space-y-2 {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      height: 100%;
    }

    .personal-media--edit .personal-media__frame ::ng-deep :is(.pf-editor-upload-zone, .pf-editor-upload-preview) {
      flex: 1;
      min-height: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .personal-media--edit .personal-media__frame ::ng-deep .pf-editor-upload-preview:has(> img) {
      height: 100%;
      max-height: none;
    }

    .personal-media--edit .personal-media__frame ::ng-deep .pf-editor-upload-preview img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
    }

    .personal-media--edit .personal-media__frame ::ng-deep .pf-editor-hint {
      display: none;
    }

    @media (max-width: 920px) {
      .personal-grid {
        grid-template-columns: 1fr;
      }

      .personal-media {
        justify-content: center;
      }

      .personal-media__frame {
        width: min(100%, 11rem);
      }
    }

    @media (max-width: 540px) {
      .personal-details__names,
      .personal-details__contact {
        grid-template-columns: 1fr;
      }

      .personal-media__frame {
        max-width: none;
        width: min(100%, 10rem);
      }
    }

  `

})

export class PersonalInfoSectionComponent implements OnInit {
  readonly state = inject(AdminUserStateService);
  private readonly documentUpload = inject(DocumentUploadService);
  private readonly notifications = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly countriesService = inject(CountriesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly sectionIcon = UserRound;
  readonly firstNameIcon = UserRound;
  readonly lastNameIcon = UserRound;
  readonly phoneIcon = Phone;
  readonly emailIcon = Mail;

  readonly expanded = signal(false);

  readonly editing = signal(false);

  readonly profileImageDraft = signal('');

  private pendingProfileImageFile: File | null = null;

  private snapshot = '';



  readonly firstName = computed(() => this.state.user()?.firstName ?? '');

  readonly lastName = computed(() => this.state.user()?.lastName ?? '');
  readonly email = computed(() => this.state.user()?.email ?? '');

  readonly profileImageUrl = computed(() => getUserProfileImageUrl(this.state.user()));



  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.maxLength(120)]],
    lastName: ['', [Validators.maxLength(120)]],
    phone: [{ ...EMPTY_PHONE_NUMBER }],
    email: ['', [Validators.email, Validators.maxLength(320)]]
  });

  constructor() {
    effect(() => {
      if (this.state.user() && !this.editing()) {
        this.patchFromUser();
      }
    });
  }

  ngOnInit(): void {
    this.syncPhoneEnableState();
    this.countriesService.load();

    this.countriesService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          if (this.state.user()) {
            this.patchPhoneFieldsFromUser();
          }
        },
        error: (err) => this.notifications.errorFromApi(err, 'Could not load countries.')
      });
  }

  displayMobile(): string {
    const formatted = formatPhoneWithDialCode(this.form.getRawValue().phone);
    return displayPhoneValue(formatted ?? this.state.user()?.mobileNumber);
  }

  isComplete(): boolean {

    const user = this.state.user();

    return Boolean(user?.firstName?.trim() && user?.email?.trim());

  }



  startEdit(): void {

    this.patchFromUser();

    this.snapshot = JSON.stringify({

      form: this.form.getRawValue(),

      profileImage: this.profileImageDraft(),

      hadPendingFile: Boolean(this.pendingProfileImageFile)

    });

    this.editing.set(true);
    this.syncPhoneEnableState();
  }



  cancelEdit(): void {

    if (this.snapshot) {

      const parsed = JSON.parse(this.snapshot) as {

        form: { firstName: string; lastName: string; phone: PhoneNumberValue; email: string };

        profileImage: string;

      };

      this.form.patchValue(parsed.form);

      this.profileImageDraft.set(parsed.profileImage || '');

    } else {

      this.patchFromUser();

    }

    this.pendingProfileImageFile = null;
    this.editing.set(false);
    this.syncPhoneEnableState();
  }



  save(): void {

    const user = this.state.user();

    if (!user?.id || this.state.saving()) {

      return;

    }



    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }



    void this.buildUpdatePayload(user.id).then((payload) => {

      this.state.saveProfile(payload).subscribe({
          next: (updated) => {
            this.pendingProfileImageFile = null;
            this.profileImageDraft.set(getUserProfileImageUrl(updated));
            this.patchFromUser();
            this.editing.set(false);
          },
          error: (err) => this.notifications.errorFromApi(err, 'Could not save profile.')
        });

    }).catch(() => {

      this.notifications.error('Could not prepare profile image for upload.');

    });

  }



  onProfileImageSelected(event: { file: File; dataUrl: string }): void {

    this.pendingProfileImageFile = event.file;

    this.profileImageDraft.set(event.dataUrl);

  }



  onProfileImageCleared(): void {
    this.deleteStoredDocument(this.state.user()?.profileImageDocumentId);
    this.pendingProfileImageFile = null;
    this.profileImageDraft.set('');
  }

  private deleteStoredDocument(documentId: string | null | undefined): void {
    const id = documentId?.trim();
    if (!id) {
      return;
    }
    this.documentUpload.delete(id).subscribe({
      error: () => this.notifications.warning('Could not delete profile image file.')
    });
  }



  private patchFromUser(): void {
    this.form.patchValue({
      firstName: this.firstName(),
      lastName: this.lastName(),
      email: this.email()
    });
    this.patchPhoneFieldsFromUser();
    this.profileImageDraft.set(this.profileImageUrl());
    this.pendingProfileImageFile = null;
    this.syncPhoneEnableState();
  }

  private patchPhoneFieldsFromUser(): void {
    const user = this.state.user();
    if (!user) {
      return;
    }
    this.form.patchValue(
      {
        phone: parsePhoneNumberValue(user.mobileNumber, this.countriesService.countries())
      },
      { emitEvent: false }
    );
    this.form.controls.phone.updateValueAndValidity({ emitEvent: false });
  }

  private syncPhoneEnableState(): void {
    if (!this.editing()) {
      this.form.controls.phone.disable({ emitEvent: false });
      return;
    }
    this.form.controls.phone.enable({ emitEvent: false });
  }



  private async buildUpdatePayload(userId: string) {

    const raw = this.form.getRawValue();

    let profileImage = undefined as

      | Awaited<ReturnType<typeof buildProfileImagePayload>>

      | null

      | undefined;



    if (this.pendingProfileImageFile) {

      profileImage = await buildProfileImagePayload(this.pendingProfileImageFile);

    } else if (isDataUrl(this.profileImageDraft())) {

      profileImage = buildProfileImagePayloadFromDataUrl(this.profileImageDraft());

    } else if (!this.profileImageDraft().trim() && this.profileImageUrl()) {

      profileImage = null;

    }



    return {

      id: userId,

      firstName: raw.firstName.trim(),

      lastName: raw.lastName.trim(),

      email: raw.email.trim(),

      mobileNumber: formatPhoneForApi(raw.phone),

      ...(profileImage !== undefined ? { profileImage } : {})

    };

  }

}


