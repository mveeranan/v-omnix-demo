import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Settings, Truck, CreditCard, Percent, FileText } from 'lucide-angular';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { AdminFormSectionCardComponent } from '@features/admin/shared/admin-form-section-card.component';
import { SettingsService } from './data-access/settings.service';
import { SettingsCategory, StoreSettings } from './models/store-settings.model';

const SECTIONS: { id: SettingsCategory; label: string; icon: any }[] = [
  { id: 'general', label: 'Store Setup', icon: Settings },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payment', label: 'Payments', icon: CreditCard },
  { id: 'tax', label: 'Tax', icon: Percent },
  { id: 'policies', label: 'Store Policies', icon: FileText }
];

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminPageShellComponent, AdminFormSectionCardComponent, LucideAngularModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(SettingsService);

  readonly sections = SECTIONS;
  readonly settings = signal<StoreSettings | null>(null);

  readonly icons = {
    general: Settings,
    shipping: Truck,
    payment: CreditCard,
    tax: Percent,
    policies: FileText
  };

  private readonly editingMap = signal<Record<SettingsCategory, boolean>>({
    general: false,
    shipping: false,
    payment: false,
    tax: false,
    policies: false
  });

  private readonly expandedMap = signal<Record<SettingsCategory, boolean>>({
    general: false,
    shipping: false,
    payment: false,
    tax: false,
    policies: false
  });

  private readonly savingMap = signal<Record<SettingsCategory, boolean>>({
    general: false,
    shipping: false,
    payment: false,
    tax: false,
    policies: false
  });

  readonly editingStates = computed(() => this.editingMap());
  readonly expandedSections = computed(() => this.expandedMap());
  readonly savingStates = computed(() => this.savingMap());

  readonly policyFields = [
    { key: 'returnPolicy', label: 'Return policy' },
    { key: 'refundPolicy', label: 'Refund policy' },
    { key: 'shippingPolicy', label: 'Shipping policy' },
    { key: 'privacyPolicy', label: 'Privacy policy' },
    { key: 'termsAndConditions', label: 'Terms & conditions' },
    { key: 'warrantyInfo', label: 'Warranty' }
  ] as const;

  readonly generalForm = this.fb.nonNullable.group({
    storeName: '',
    tagline: '',
    timezone: '',
    currency: '',
    storeUrl: '',
    supportEmail: '',
    supportPhone: ''
  });

  readonly shippingForm = this.fb.nonNullable.group({
    enabled: true,
    defaultShippingCost: 50,
    freeShippingEnabled: true,
    freeShippingThreshold: 500,
    zones: this.fb.array([])
  });

  readonly paymentForm = this.fb.nonNullable.group({
    stripe: false,
    razorpay: false,
    upi: true,
    card: true,
    wallet: false,
    cod: true,
    stripeTestMode: true,
    stripePublicKey: '',
    stripeSecretKey: '',
    razorpayApiKey: '',
    razorpaySecretKey: '',
    codMinOrder: 0
  });

  readonly taxForm = this.fb.nonNullable.group({
    calculateTax: true,
    taxType: 'GST' as 'GST' | 'VAT' | 'Sales Tax',
    taxRate: 18,
    taxId: '',
    applyTaxToShipping: false,
    pricesIncludeTax: false,
    rules: this.fb.array([])
  });

  readonly policiesForm = this.fb.nonNullable.group({
    returnPolicy: '',
    refundPolicy: '',
    shippingPolicy: '',
    privacyPolicy: '',
    termsAndConditions: '',
    warrantyInfo: ''
  });

  ngOnInit(): void {
    this.api.getAll().subscribe((s) => {
      this.settings.set(s);
      this.generalForm.patchValue({
        storeName: s.general.storeName || '',
        tagline: s.general.tagline || '',
        timezone: s.general.timezone || '',
        currency: s.general.currency || '',
        storeUrl: s.general.storeUrl || '',
        supportEmail: s.general.supportEmail || '',
        supportPhone: s.general.supportPhone || ''
      });
      this.shippingForm.patchValue({
        enabled: s.shipping.enabled,
        defaultShippingCost: s.shipping.defaultShippingCost,
        freeShippingEnabled: s.shipping.freeShippingEnabled,
        freeShippingThreshold: s.shipping.freeShippingThreshold
      });
      this.paymentForm.patchValue({
        stripe: s.payment.stripe,
        razorpay: s.payment.razorpay,
        upi: s.payment.upi,
        card: s.payment.card,
        wallet: s.payment.wallet,
        cod: s.payment.cod,
        stripeTestMode: s.payment.stripeTestMode,
        stripePublicKey: s.payment.stripePublicKey || '',
        stripeSecretKey: s.payment.stripeSecretKey || '',
        razorpayApiKey: s.payment.razorpayApiKey || '',
        razorpaySecretKey: s.payment.razorpaySecretKey || '',
        codMinOrder: s.payment.codMinOrder
      });
      this.taxForm.patchValue({
        calculateTax: s.tax.calculateTax,
        taxType: s.tax.taxType,
        taxRate: s.tax.taxRate,
        taxId: s.tax.taxId || '',
        applyTaxToShipping: s.tax.applyTaxToShipping,
        pricesIncludeTax: s.tax.pricesIncludeTax
      });
      this.policiesForm.patchValue(s.policies);
    });
  }

  toggleEdit(category: SettingsCategory): void {
    const isEditing = this.editingMap()[category];
    if (!isEditing) {
      this.expandedMap.update((m) => ({ ...m, [category]: true }));
    }
    this.editingMap.update((m) => ({ ...m, [category]: !isEditing }));
  }

  cancelEdit(category: SettingsCategory): void {
    this.editingMap.update((m) => ({ ...m, [category]: false }));
  }

  private setSaving(category: SettingsCategory, saving: boolean): void {
    this.savingMap.update((m) => ({ ...m, [category]: saving }));
  }

  private onSaveComplete(category: SettingsCategory, result: StoreSettings): void {
    this.settings.set(result);
    this.setSaving(category, false);
    this.editingMap.update((m) => ({ ...m, [category]: false }));
  }

  saveGeneral(): void {
    const s = this.settings();
    if (!s) return;
    this.setSaving('general', true);
    this.api.updateCategory('general', { ...s.general, ...this.generalForm.getRawValue() }).subscribe({
      next: (u) => this.onSaveComplete('general', u),
      error: () => this.setSaving('general', false)
    });
  }

  saveShipping(): void {
    const s = this.settings();
    if (!s) return;
    this.setSaving('shipping', true);
    const v = this.shippingForm.getRawValue();
    this.api.updateCategory('shipping', { ...s.shipping, ...v }).subscribe({
      next: (u) => this.onSaveComplete('shipping', u),
      error: () => this.setSaving('shipping', false)
    });
  }

  savePayment(): void {
    const s = this.settings();
    if (!s) return;
    this.setSaving('payment', true);
    this.api.updateCategory('payment', { ...s.payment, ...this.paymentForm.getRawValue() }).subscribe({
      next: (u) => this.onSaveComplete('payment', u),
      error: () => this.setSaving('payment', false)
    });
  }

  saveTax(): void {
    const s = this.settings();
    if (!s) return;
    this.setSaving('tax', true);
    this.api.updateCategory('tax', { ...s.tax, ...this.taxForm.getRawValue() }).subscribe({
      next: (u) => this.onSaveComplete('tax', u),
      error: () => this.setSaving('tax', false)
    });
  }

  savePolicies(): void {
    const s = this.settings();
    if (!s) return;
    this.setSaving('policies', true);
    this.api.updateCategory('policies', { ...s.policies, ...this.policiesForm.getRawValue() }).subscribe({
      next: (u) => this.onSaveComplete('policies', u),
      error: () => this.setSaving('policies', false)
    });
  }

  /** Stripe is toggled on but one or both credentials are missing. */
  get stripeNeedsKeys(): boolean {
    const v = this.paymentForm.getRawValue();
    return v.stripe && (!v.stripePublicKey?.trim() || !v.stripeSecretKey?.trim());
  }

  /** Razorpay is toggled on but one or both credentials are missing. */
  get razorpayNeedsKeys(): boolean {
    const v = this.paymentForm.getRawValue();
    return v.razorpay && (!v.razorpayApiKey?.trim() || !v.razorpaySecretKey?.trim());
  }

  getWebhookUrl(provider: 'stripe' | 'razorpay'): string {
    const baseUrl = this.settings()?.general?.storeUrl || '';
    if (!baseUrl) return '';

    const webhookPath: Record<string, string> = {
      stripe: '/api/webhooks/stripe',
      razorpay: '/api/webhooks/razorpay'
    };

    return baseUrl.replace(/\/$/, '') + (webhookPath[provider] || '');
  }

  getPaymentMethodsDisplay(): string {
    const s = this.settings()?.payment;
    if (!s) return 'No payment methods';
    const methods: string[] = [];
    if (s.stripe) methods.push('Stripe');
    if (s.razorpay) methods.push('Razorpay');
    if (s.upi) methods.push('UPI');
    if (s.card) methods.push('Card');
    if (s.wallet) methods.push('Wallet');
    if (s.cod) methods.push('COD');
    return methods.length ? methods.join(', ') : 'No payment methods';
  }

  getPoliciesCount(): number {
    const p = this.settings()?.policies;
    if (!p) return 0;
    return Object.values(p).filter((v) => v && typeof v === 'string' && v.trim().length > 0).length;
  }

  getPolicyValue(key: string): string {
    const p = this.settings()?.policies as Record<string, string> | undefined;
    return p?.[key] || '';
  }

}
