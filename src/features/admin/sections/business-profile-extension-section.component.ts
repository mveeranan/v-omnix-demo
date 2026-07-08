import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminProfileStateService } from '../data-access/admin-profile-state.service';
import { BusinessProfileExtensionService } from '../data-access/business-profile-extension.service';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from '@core/notifications/notification.service';
import { OnboardingService } from '../services/onboarding.service';
import {
  BUSINESS_SLUG_PATTERN,
  BusinessProfileExtension,
  canPublishProfile
} from '../models/business-profile-extension.model';

type ProfileTab = 'branding' | 'store';

@Component({
  selector: 'app-business-profile-extension-section',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
      @for (tab of tabs; track tab.id) {
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          [class.bg-[var(--accent-muted)]]="activeTab() === tab.id"
          [class.text-[var(--accent)]]="activeTab() === tab.id"
          (click)="activeTab.set(tab.id)"
        >
          {{ tab.label }}
        </button>
      }
    </div>

    @if (activeTab() === 'branding') {
      <section class="admin-glass-card space-y-4 rounded-xl p-6">
        <h3 class="font-semibold">Branding</h3>
        <p class="text-sm text-[var(--text-secondary)]">Tagline and brand colors</p>
        <form [formGroup]="brandingForm" class="pf-editor-fields max-w-xl" (ngSubmit)="saveBranding()">
          <div class="pf-editor-field">
            <span class="pf-editor-label">Tagline</span>
            <input class="pf-editor-input" formControlName="tagline" placeholder="Quality products, delivered with care" />
          </div>
          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            <div class="pf-editor-field">
              <span class="pf-editor-label">Primary color</span>
              <input class="pf-editor-input h-10" type="color" formControlName="primaryColor" />
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Secondary color</span>
              <input class="pf-editor-input h-10" type="color" formControlName="secondaryColor" />
            </div>
          </div>
          <button type="submit" class="admin-section-action-btn">Save branding</button>
        </form>
      </section>
    }

    @if (activeTab() === 'store') {
      <section class="admin-glass-card space-y-4 rounded-xl p-6">
        <h3 class="font-semibold">Store URL</h3>
        <p class="text-sm text-[var(--text-secondary)]">Public store address and visibility</p>
        <form [formGroup]="storeForm" class="pf-editor-fields max-w-xl" (ngSubmit)="saveStore()">
          <div class="pf-editor-field">
            <span class="pf-editor-label">Store slug <span class="text-rose-500">*</span></span>
            <input class="pf-editor-input" formControlName="businessSlug" placeholder="my-store" />
            @if (storeForm.controls.businessSlug.touched && storeForm.controls.businessSlug.invalid) {
              <p class="pf-editor-error">Use lowercase letters, numbers, and hyphens only.</p>
            }
            <p class="mt-1 text-xs text-[var(--text-secondary)]">
              Preview: <a [routerLink]="storePreviewLink()" target="_blank" class="text-[var(--accent)] underline">/store/{{ storeForm.value.businessSlug || 'my-store' }}</a>
            </p>
          </div>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" formControlName="isPublished" />
            Publish store (visible to visitors)
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" formControlName="enableEcommerce" />
            Enable e-commerce (shop & checkout)
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" formControlName="isActive" />
            Store is active
          </label>
          @if (!canPublish()) {
            <p class="rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
              Set business name (Identity tab) and a valid slug before publishing.
            </p>
          }
          <button type="submit" class="admin-section-action-btn" [disabled]="!canPublish() && storeForm.value.isPublished">Save store settings</button>
        </form>
      </section>
    }

  `
})
export class BusinessProfileExtensionSectionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly extService = inject(BusinessProfileExtensionService);
  private readonly authService = inject(AuthService);
  private readonly profileState = inject(AdminProfileStateService);
  private readonly notifications = inject(NotificationService);
  private readonly onboarding = inject(OnboardingService);

  readonly activeTab = signal<ProfileTab>('branding');
  readonly tabs = [
    { id: 'branding' as const, label: 'Branding' },
    { id: 'store' as const, label: 'Store URL' }
  ];

  private ext: BusinessProfileExtension = {
    businessSlug: '',
    tagline: '',
    primaryColor: '#263238',
    secondaryColor: '#ff6f00',
    isPublished: false,
    enableEcommerce: true,
    isActive: true,
    metaTitle: '',
    metaDescription: '',
    customDomain: ''
  };

  readonly brandingForm = this.fb.nonNullable.group({
    tagline: [''],
    primaryColor: ['#263238'],
    secondaryColor: ['#ff6f00']
  });

  readonly storeForm = this.fb.nonNullable.group({
    businessSlug: ['', [Validators.required, Validators.pattern(BUSINESS_SLUG_PATTERN)]],
    isPublished: [false],
    enableEcommerce: [true],
    isActive: [true]
  });


  ngOnInit(): void {
    this.loadExt();
  }

  brandingComplete(): boolean {
    return Boolean(this.ext.tagline.trim());
  }

  storeComplete(): boolean {
    return Boolean(this.ext.businessSlug.trim() && this.ext.isPublished);
  }


  canPublish(): boolean {
    return canPublishProfile(this.profileState.profile()?.businessName, this.ext);
  }

  storePreviewLink(): string[] {
    const slug = this.storeForm.value.businessSlug || 'my-store';
    return ['/store', slug];
  }

  saveBranding(): void {
    this.mergeAndSave({ ...this.brandingForm.getRawValue() });
    this.notifications.success('Branding saved');
  }

  saveStore(): void {
    if (this.storeForm.invalid) {
      this.storeForm.markAllAsTouched();
      return;
    }
    const raw = this.storeForm.getRawValue();
    if (raw.isPublished && !this.canPublish()) {
      this.notifications.warning('Cannot publish without business name and valid slug.');
      return;
    }
    this.mergeAndSave(raw);
    this.notifications.success('Store settings saved');
  }


  private loadExt(): void {
    const tenantId = this.authService.resolveTenantId() ?? '';
    this.ext = this.extService.load(tenantId);
    this.brandingForm.patchValue({
      tagline: this.ext.tagline,
      primaryColor: this.ext.primaryColor,
      secondaryColor: this.ext.secondaryColor
    });
    this.storeForm.patchValue({
      businessSlug: this.ext.businessSlug,
      isPublished: this.ext.isPublished,
      enableEcommerce: this.ext.enableEcommerce,
      isActive: this.ext.isActive
    });
  }

  private mergeAndSave(patch: Partial<BusinessProfileExtension>): void {
    const tenantId = this.authService.resolveTenantId() ?? '';
    this.ext = { ...this.ext, ...patch };
    this.extService.save(tenantId, this.ext);
    this.onboarding.refresh();
  }
}
