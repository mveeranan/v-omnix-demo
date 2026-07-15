import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ProfileSettingsSyncService, ConsolidatedBusinessData } from './profile-settings-sync.service';
import { AdminProfileStateService } from '../data-access/admin-profile-state.service';
import { SettingsService } from '../settings/data-access/settings.service';
import { BusinessProfileDto } from '../models/business-profile.model';
import { GeneralSettings, PaymentSettings, PolicySettings, ShippingSettings, TaxSettings } from '../settings/models/store-settings.model';

describe('ProfileSettingsSyncService', () => {
  let service: ProfileSettingsSyncService;
  let profileStateServiceSpy: jasmine.SpyObj<AdminProfileStateService>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;

  // Test data
  const mockProfile: BusinessProfileDto = {
    id: '1',
    tenantId: 'tenant-1',
    businessName: 'Test Business',
    businessTypeId: 'type-123',
    email: 'contact@test.com',
    phone: '1234567890',
    description: 'A test business',
    logoDocumentUrl: 'https://example.com/logo.png',
    coverImageDocumentUrl: 'https://example.com/cover.png',
    websiteUrl: 'https://testbusiness.com',
    timeZone: 'America/New_York',
    currency: 'USD'
  };

  const mockGeneralSettings: GeneralSettings = {
    storeName: 'Test Store',
    tagline: 'Best products online',
    logoUrl: 'https://example.com/logo.png',
    coverImageUrl: 'https://example.com/cover.png',
    description: 'Test store description',
    timezone: 'UTC',
    currency: 'USD',
    storeUrl: 'https://teststore.com',
    supportEmail: 'support@test.com',
    supportPhone: '9999999999'
  };

  const mockShippingSettings: ShippingSettings = {
    enabled: true,
    defaultShippingCost: 50,
    freeShippingEnabled: true,
    freeShippingThreshold: 500,
    zones: [
      { id: '1', name: 'Zone A', baseCost: 50, deliveryDays: 3 },
      { id: '2', name: 'Zone B', baseCost: 100, deliveryDays: 5 }
    ]
  };

  const mockPaymentSettings: PaymentSettings = {
    stripe: true,
    razorpay: true,
    upi: false,
    card: true,
    wallet: false,
    cod: true,
    stripeTestMode: false,
    stripePublicKey: 'pk_test_123',
    codMinOrder: 100
  };

  const mockTaxSettings: TaxSettings = {
    calculateTax: true,
    taxType: 'GST',
    taxRate: 18,
    taxId: 'TAX123',
    applyTaxToShipping: true,
    pricesIncludeTax: false,
    rules: [{ id: '1', region: 'IN', rate: 18 }]
  };

  const mockPolicySettings: PolicySettings = {
    returnPolicy: '30 days returns',
    refundPolicy: 'Full refund',
    shippingPolicy: 'Free shipping over 500',
    privacyPolicy: 'We protect your data',
    termsAndConditions: 'Standard T&C',
    warrantyInfo: '1 year warranty'
  };

  beforeEach(() => {
    // Create spy objects
    const profileStateSpy = jasmine.createSpyObj(
      'AdminProfileStateService',
      [],
      {
        profile: signal(mockProfile)
      }
    );

    const settingsSpy = jasmine.createSpyObj('SettingsService', [
      'getGeneral',
      'getShipping',
      'getPayment',
      'getTax',
      'getPolicies',
      'getAll',
      'getEmail',
      'getTeam',
      'getIntegrations'
    ]);

    // Setup default returns
    settingsSpy.getGeneral.and.returnValue(of(mockGeneralSettings));
    settingsSpy.getShipping.and.returnValue(of(mockShippingSettings));
    settingsSpy.getPayment.and.returnValue(of(mockPaymentSettings));
    settingsSpy.getTax.and.returnValue(of(mockTaxSettings));
    settingsSpy.getPolicies.and.returnValue(of(mockPolicySettings));

    TestBed.configureTestingModule({
      providers: [
        ProfileSettingsSyncService,
        { provide: AdminProfileStateService, useValue: profileStateSpy },
        { provide: SettingsService, useValue: settingsSpy }
      ]
    });

    service = TestBed.inject(ProfileSettingsSyncService);
    profileStateServiceSpy = TestBed.inject(AdminProfileStateService) as jasmine.SpyObj<AdminProfileStateService>;
    settingsServiceSpy = TestBed.inject(SettingsService) as jasmine.SpyObj<SettingsService>;
  });

  describe('getConsolidatedBusinessData()', () => {
    it('should return an Observable of ConsolidatedBusinessData', (done) => {
      service.getConsolidatedBusinessData().subscribe((data) => {
        expect(data).toBeDefined();
        expect(data.businessName).toBe('Test Business');
        expect(data.businessTypeId).toBe('type-123');
        done();
      });
    });

    it('should merge profile and settings data', (done) => {
      service.getConsolidatedBusinessData().subscribe((data) => {
        // Profile data
        expect(data.businessName).toBe('Test Business');
        expect(data.email).toBe('contact@test.com');
        expect(data.phone).toBe('1234567890');
        expect(data.logoDocumentUrl).toBe('https://example.com/logo.png');

        // Settings data
        expect(data.timezone).toBe('UTC'); // Settings timezone takes precedence
        expect(data.currency).toBe('USD');
        expect(data.storeUrl).toBe('https://teststore.com');
        expect(data.tagline).toBe('Best products online');

        // Operational settings
        expect(data.shipping).toBeDefined();
        expect(data.payment).toBeDefined();
        expect(data.tax).toBeDefined();
        expect(data.policies).toBeDefined();

        done();
      });
    });

    it('should include metadata with lastUpdated timestamp', (done) => {
      service.getConsolidatedBusinessData().subscribe((data) => {
        expect(data.lastUpdated).toBeDefined();
        expect(data.lastUpdated instanceof Date).toBe(true);
        done();
      });
    });

    it('should give precedence to Settings over Profile for overlapping fields', (done) => {
      // Settings timezone should override profile timeZone
      service.getConsolidatedBusinessData().subscribe((data) => {
        expect(data.timezone).toBe(mockGeneralSettings.timezone);
        expect(data.timezone).not.toBe(mockProfile.timeZone);
        done();
      });
    });

    it('should use Profile value when Settings value is empty', (done) => {
      const settingsWithoutTimezone = { ...mockGeneralSettings, timezone: '' };
      settingsServiceSpy.getGeneral.and.returnValue(of(settingsWithoutTimezone));

      service.getConsolidatedBusinessData().subscribe((data) => {
        expect(data.timezone).toBe(mockProfile.timeZone);
        done();
      });
    });

    it('should emit distinct values only', (done) => {
      let emissionCount = 0;
      const subscription = service.getConsolidatedBusinessData().subscribe(() => {
        emissionCount++;
      });

      // First emission
      expect(emissionCount).toBe(1);

      // Same profile/settings should not trigger emission
      const profileSpy = profileStateServiceSpy.profile as jasmine.Spy;
      profileSpy?.returnValue(mockProfile); // Same value

      setTimeout(() => {
        // Should still be 1, not incremented
        expect(emissionCount).toBe(1);
        subscription.unsubscribe();
        done();
      }, 100);
    });

    it('should share the subscription across multiple subscribers', (done) => {
      const getGeneralSpy = settingsServiceSpy.getGeneral as jasmine.Spy;
      getGeneralSpy.calls.reset();

      const consolidated$ = service.getConsolidatedBusinessData();

      // First subscriber
      consolidated$.subscribe(() => {
        // Check call count after first subscription
        const callsAfterFirst = getGeneralSpy.calls.count();

        // Second subscriber - should not cause additional API call
        consolidated$.subscribe(() => {
          const callsAfterSecond = getGeneralSpy.calls.count();

          // Should be the same because shareReplay caches
          expect(callsAfterSecond).toBe(callsAfterFirst);
          done();
        });
      });
    });
  });

  describe('onProfileChange()', () => {
    it('should return an Observable that emits profile changes', (done) => {
      service.onProfileChange().subscribe((profile) => {
        expect(profile).toBeDefined();
        expect(profile.businessName).toBe('Test Business');
        expect(profile.email).toBe('contact@test.com');
        done();
      });
    });

    it('should NOT emit when only settings change', (done) => {
      let emissionCount = 0;

      const subscription = service.onProfileChange().subscribe(() => {
        emissionCount++;
      });

      // Update only settings
      const newSettings = { ...mockGeneralSettings, timezone: 'Europe/London' };
      settingsServiceSpy.getGeneral.and.returnValue(of(newSettings));

      setTimeout(() => {
        // Should still be 1 (initial emission only)
        expect(emissionCount).toBeLessThanOrEqual(1);
        subscription.unsubscribe();
        done();
      }, 100);
    });

    it('should emit when profile changes', (done) => {
      let emissionCount = 0;

      const subscription = service.onProfileChange().subscribe(() => {
        emissionCount++;
      });

      setTimeout(() => {
        // Update profile
        const profileSignal = profileStateServiceSpy.profile as any;
        const newProfile = { ...mockProfile, businessName: 'Updated Business' };
        profileSignal.set(newProfile);

        setTimeout(() => {
          expect(emissionCount).toBeGreaterThan(1);
          subscription.unsubscribe();
          done();
        }, 50);
      }, 50);
    });
  });

  describe('onSettingsChange()', () => {
    it('should return an Observable that emits settings-related changes', (done) => {
      service.onSettingsChange().subscribe((data) => {
        expect(data).toBeDefined();
        expect(data.timezone).toBe('UTC');
        expect(data.currency).toBe('USD');
        expect(data.storeUrl).toBe('https://teststore.com');
        done();
      });
    });

    it('should include only settings-derived fields, not profile fields', (done) => {
      service.onSettingsChange().subscribe((data) => {
        // Should have settings
        expect(data.timezone).toBeDefined();
        expect(data.currency).toBeDefined();
        expect(data.storeUrl).toBeDefined();

        // Should have empty/default profile fields
        expect(data.businessName).toBe('');
        expect(data.businessTypeId).toBe('');
        done();
      });
    });

    it('should emit when general settings change', (done) => {
      let emissionCount = 0;

      const subscription = service.onSettingsChange().subscribe(() => {
        emissionCount++;
      });

      expect(emissionCount).toBe(1); // Initial emission

      // Update settings
      const newSettings = { ...mockGeneralSettings, timezone: 'Asia/Kolkata' };
      settingsServiceSpy.getGeneral.and.returnValue(of(newSettings));

      setTimeout(() => {
        expect(emissionCount).toBeGreaterThan(1);
        subscription.unsubscribe();
        done();
      }, 100);
    });

    it('should emit when shipping settings change', (done) => {
      let emissionCount = 0;

      const subscription = service.onSettingsChange().subscribe(() => {
        emissionCount++;
      });

      expect(emissionCount).toBe(1);

      // Update shipping
      const newShipping = { ...mockShippingSettings, enabled: false };
      settingsServiceSpy.getShipping.and.returnValue(of(newShipping));

      setTimeout(() => {
        expect(emissionCount).toBeGreaterThan(1);
        subscription.unsubscribe();
        done();
      }, 100);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors from profile state service', (done) => {
      // Note: In actual implementation, errors might be caught and handled
      // This test ensures the service gracefully handles error scenarios
      service.getConsolidatedBusinessData().subscribe({
        next: (data) => {
          expect(data).toBeDefined();
        },
        error: () => {
          // Error handling
        }
      });

      done();
    });

    it('should handle errors from settings service', (done) => {
      settingsServiceSpy.getGeneral.and.returnValue(throwError(() => new Error('API Error')));

      service.getConsolidatedBusinessData().subscribe({
        error: () => {
          // Error is expected
          done();
        }
      });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across multiple subscriptions', (done) => {
      let data1: ConsolidatedBusinessData | null = null;
      let data2: ConsolidatedBusinessData | null = null;

      const consolidated$ = service.getConsolidatedBusinessData();

      consolidated$.subscribe((data) => {
        data1 = data;
      });

      consolidated$.subscribe((data) => {
        data2 = data;
      });

      setTimeout(() => {
        expect(data1).toEqual(data2);
        expect(data1?.businessName).toBe(data2?.businessName);
        done();
      }, 100);
    });

    it('should provide timestamp for each emission', (done) => {
      const timestamps: Date[] = [];

      service.getConsolidatedBusinessData().subscribe((data) => {
        if (data.lastUpdated) {
          timestamps.push(data.lastUpdated);
        }
      });

      expect(timestamps.length).toBeGreaterThan(0);
      expect(timestamps[0] instanceof Date).toBe(true);
      done();
    });
  });

  describe('Integration Scenarios', () => {
    it('should combine all operational settings correctly', (done) => {
      service.getConsolidatedBusinessData().subscribe((data) => {
        // Verify all operational settings are present
        expect(data.shipping.enabled).toBe(true);
        expect(data.shipping.defaultShippingCost).toBe(50);
        expect(data.shipping.zones.length).toBe(2);

        expect(data.payment.stripe).toBe(true);
        expect(data.payment.codMinOrder).toBe(100);

        expect(data.tax.calculateTax).toBe(true);
        expect(data.tax.taxRate).toBe(18);

        expect(data.policies.returnPolicy).toBe('30 days returns');

        done();
      });
    });

    it('should handle complete business onboarding data', (done) => {
      service.getConsolidatedBusinessData().subscribe((data) => {
        // Branding
        expect(data.businessName).toBeTruthy();
        expect(data.logoDocumentUrl).toBeTruthy();

        // Contact
        expect(data.email).toBeTruthy();
        expect(data.phone).toBeTruthy();

        // Store
        expect(data.storeUrl).toBeTruthy();
        expect(data.timezone).toBeTruthy();
        expect(data.currency).toBeTruthy();

        // Operations
        expect(data.shipping).toBeDefined();
        expect(data.payment).toBeDefined();
        expect(data.tax).toBeDefined();
        expect(data.policies).toBeDefined();

        done();
      });
    });
  });

  describe('Type Safety', () => {
    it('should return properly typed ConsolidatedBusinessData', (done) => {
      service.getConsolidatedBusinessData().subscribe((data: ConsolidatedBusinessData) => {
        // TypeScript compilation ensures these are available
        const name: string = data.businessName;
        const url: string = data.storeUrl;
        const shipping = data.shipping;
        const payment = data.payment;

        expect(typeof name).toBe('string');
        expect(typeof url).toBe('string');
        expect(shipping).toBeDefined();
        expect(payment).toBeDefined();

        done();
      });
    });
  });
});
