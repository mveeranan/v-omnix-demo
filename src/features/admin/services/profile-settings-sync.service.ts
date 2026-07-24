import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, distinctUntilChanged, shareReplay, map } from 'rxjs';
import { AdminProfileStateService } from '../data-access/admin-profile-state.service';
import { SettingsService } from '../settings/data-access/settings.service';
import { BusinessProfileDto } from '../models/business-profile.model';
import {
  GeneralSettings,
  PaymentSettings,
  PolicySettings,
  ShippingSettings,
  TaxSettings
} from '../settings/models/store-settings.model';

/**
 * Represents the complete consolidated data from both Business Profile and Settings.
 * This unified view prevents duplicate data maintenance across components.
 */
export interface ConsolidatedBusinessData {
  // From Business Profile
  businessName: string;
  businessTypeId: string;
  logoDocumentId?: string | null;
  logoDocumentUrl?: string | null;
  coverImageDocumentId?: string | null;
  coverImageDocumentUrl?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  tenantId?: string;

  // From Business Profile (extended)
  tagline?: string | null;

  // From Settings - General
  timezone: string;
  currency: string;

  // From Settings - Operational
  shipping: ShippingSettings;
  payment: PaymentSettings;
  tax: TaxSettings;
  policies: PolicySettings;

  // Metadata
  lastUpdated?: Date;
}

/**
 * Service that provides a single source of truth for consolidated business data.
 *
 * This service combines Business Profile data with Store Settings to prevent
 * components (Portfolio, Website Builder, etc.) from maintaining separate copies
 * of the same consolidated data.
 *
 * Usage:
 * ```typescript
 * constructor(private syncService: ProfileSettingsSyncService) {}
 *
 * consolidatedData$ = this.syncService.getConsolidatedBusinessData();
 *
 * ngOnInit() {
 *   this.consolidatedData$.subscribe(data => {
 *     console.log('Business Name:', data.businessName);
 *     console.log('Store URL:', data.storeUrl);
 *     console.log('Shipping Settings:', data.shipping);
 *   });
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ProfileSettingsSyncService {
  private readonly profileStateService = inject(AdminProfileStateService);
  private readonly settingsService = inject(SettingsService);

  /**
   * Observable that emits consolidated business data whenever either profile or settings change.
   * Data is deduplicated with distinctUntilChanged to prevent unnecessary emissions.
   * Result is shared across all subscribers to avoid redundant API calls.
   */
  private readonly consolidatedData$: Observable<ConsolidatedBusinessData> = combineLatest([
    this.profileStateService.profile.asObservable(),
    this.settingsService.getGeneral(),
    this.settingsService.getShipping(),
    this.settingsService.getPayment(),
    this.settingsService.getTax(),
    this.settingsService.getPolicies()
  ]).pipe(
    map(([profile, general, shipping, payment, tax, policies]) =>
      this.mergeProfileAndSettings(profile, general, shipping, payment, tax, policies)
    ),
    distinctUntilChanged((prev, curr) => this.dataEquals(prev, curr)),
    shareReplay(1)
  );

  /**
   * Observable that emits only when Business Profile data changes.
   * Useful for components that need to react to profile updates specifically.
   */
  private readonly profileChange$: Observable<BusinessProfileDto> =
    this.profileStateService.profile.asObservable().pipe(
      distinctUntilChanged((prev, curr) => this.profileEquals(prev, curr)),
      shareReplay(1)
    );

  /**
   * Observable that emits only when Settings data changes.
   * Useful for components that need to react to settings updates specifically.
   */
  private readonly settingsChange$: Observable<ConsolidatedBusinessData> = combineLatest([
    this.settingsService.getGeneral(),
    this.settingsService.getShipping(),
    this.settingsService.getPayment(),
    this.settingsService.getTax(),
    this.settingsService.getPolicies()
  ]).pipe(
    map(([general, shipping, payment, tax, policies]) => ({
      timezone: general.timezone,
      currency: general.currency,
      shipping,
      payment,
      tax,
      policies,
      businessName: '',
      businessTypeId: '',
      lastUpdated: new Date()
    })),
    distinctUntilChanged((prev, curr) =>
      prev.timezone === curr.timezone &&
      prev.currency === curr.currency &&
      JSON.stringify(prev.shipping) === JSON.stringify(curr.shipping) &&
      JSON.stringify(prev.payment) === JSON.stringify(curr.payment) &&
      JSON.stringify(prev.tax) === JSON.stringify(curr.tax) &&
      JSON.stringify(prev.policies) === JSON.stringify(curr.policies)
    ),
    shareReplay(1)
  );

  /**
   * Returns an Observable of the consolidated business data that combines
   * Business Profile (branding, identity) with Store Settings (operational, policies).
   *
   * Subscribing to this Observable will trigger data loading if not already loaded.
   * The Observable is hot-cached (multicast) to prevent duplicate API requests.
   *
   * @returns Observable<ConsolidatedBusinessData>
   *
   * @example
   * ```typescript
   * this.syncService.getConsolidatedBusinessData().subscribe({
   *   next: (data) => {
   *     this.businessName = data.businessName;
   *     this.storeUrl = data.storeUrl;
   *     this.shippingZones = data.shipping.zones;
   *   },
   *   error: (err) => console.error('Failed to load data', err)
   * });
   * ```
   */
  getConsolidatedBusinessData(): Observable<ConsolidatedBusinessData> {
    return this.consolidatedData$;
  }

  /**
   * Returns an Observable that emits only when Business Profile changes.
   * Useful if a component only needs to react to profile updates, not settings.
   *
   * @returns Observable<BusinessProfileDto>
   *
   * @example
   * ```typescript
   * this.syncService.onProfileChange().subscribe({
   *   next: (profile) => {
   *     console.log('Profile updated:', profile.businessName);
   *     this.updatePortfolioHeader(profile);
   *   }
   * });
   * ```
   */
  onProfileChange(): Observable<BusinessProfileDto> {
    return this.profileChange$;
  }

  /**
   * Returns an Observable that emits only when Store Settings change.
   * Useful if a component only needs to react to settings updates, not profile.
   *
   * @returns Observable<ConsolidatedBusinessData>
   *
   * @example
   * ```typescript
   * this.syncService.onSettingsChange().subscribe({
   *   next: (data) => {
   *     console.log('Settings updated:');
   *     console.log('Timezone:', data.timezone);
   *     console.log('Store URL:', data.storeUrl);
   *     this.updateWebsiteBuilder(data);
   *   }
   * });
   * ```
   */
  onSettingsChange(): Observable<ConsolidatedBusinessData> {
    return this.settingsChange$;
  }

  /**
   * Merges Business Profile data with Store Settings into a single consolidated object.
   * Settings values take precedence in case of conflicts with profile data.
   *
   * @private
   */
  private mergeProfileAndSettings(
    profile: BusinessProfileDto,
    general: any,
    shipping: any,
    payment: any,
    tax: any,
    policies: any
  ): ConsolidatedBusinessData {
    return {
      // Business Profile Data
      businessName: profile.businessName || '',
      businessTypeId: profile.businessTypeId || '',
      logoDocumentId: profile.logoDocumentId,
      logoDocumentUrl: profile.logoDocumentUrl,
      coverImageDocumentId: profile.coverImageDocumentId,
      coverImageDocumentUrl: profile.coverImageDocumentUrl,
      description: profile.description,
      email: profile.email,
      phone: profile.phone,
      websiteUrl: profile.websiteUrl,
      tenantId: profile.tenantId,

      // Settings - General (single source of truth for timezone and currency)
      timezone: general?.timezone || '',
      currency: general?.currency || '',
      tagline: profile.tagline,

      // Settings - Operational
      shipping: shipping || {},
      payment: payment || {},
      tax: tax || {},
      policies: policies || {},

      // Metadata
      lastUpdated: new Date()
    };
  }

  /**
   * Compares two ConsolidatedBusinessData objects for deep equality.
   * Used to prevent unnecessary Observable emissions.
   *
   * @private
   */
  private dataEquals(
    prev: ConsolidatedBusinessData | undefined,
    curr: ConsolidatedBusinessData | undefined
  ): boolean {
    if (!prev || !curr) return prev === curr;

    return (
      prev.businessName === curr.businessName &&
      prev.businessTypeId === curr.businessTypeId &&
      prev.logoDocumentUrl === curr.logoDocumentUrl &&
      prev.coverImageDocumentUrl === curr.coverImageDocumentUrl &&
      prev.description === curr.description &&
      prev.email === curr.email &&
      prev.phone === curr.phone &&
      prev.websiteUrl === curr.websiteUrl &&
      prev.tenantId === curr.tenantId &&
      prev.timezone === curr.timezone &&
      prev.currency === curr.currency &&
      prev.tagline === curr.tagline &&
      JSON.stringify(prev.shipping) === JSON.stringify(curr.shipping) &&
      JSON.stringify(prev.payment) === JSON.stringify(curr.payment) &&
      JSON.stringify(prev.tax) === JSON.stringify(curr.tax) &&
      JSON.stringify(prev.policies) === JSON.stringify(curr.policies)
    );
  }

  /**
   * Compares two BusinessProfileDto objects for equality.
   * Used to prevent unnecessary Observable emissions for profile changes.
   *
   * @private
   */
  private profileEquals(prev: BusinessProfileDto, curr: BusinessProfileDto): boolean {
    return (
      prev.businessName === curr.businessName &&
      prev.businessTypeId === curr.businessTypeId &&
      prev.email === curr.email &&
      prev.phone === curr.phone &&
      prev.description === curr.description &&
      prev.logoDocumentUrl === curr.logoDocumentUrl &&
      prev.coverImageDocumentUrl === curr.coverImageDocumentUrl &&
      prev.websiteUrl === curr.websiteUrl &&
      prev.tenantId === curr.tenantId
    );
  }
}
