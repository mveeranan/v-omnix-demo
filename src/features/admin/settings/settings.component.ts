import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { SettingsService } from './data-access/settings.service';
import { SettingsCategory, StoreSettings } from './models/store-settings.model';

const SECTIONS: { id: SettingsCategory; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payments' },
  { id: 'email', label: 'Email' },
  { id: 'tax', label: 'Tax' },
  { id: 'policies', label: 'Store Policies' },
  { id: 'team', label: 'Team' },
  { id: 'integrations', label: 'Integrations' }
];

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, AdminPageShellComponent],
  template: `
    <app-admin-page-shell eyebrow="Configuration" title="Settings" description="Configure store settings. Branding also available in Website builder.">
      <div class="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav class="space-y-1">
          @for (s of sections; track s.id) {
            <button
              type="button"
              class="block w-full rounded-lg px-3 py-2 text-left text-sm"
              [class.admin-action-primary]="active() === s.id"
              [class.admin-action-secondary]="active() !== s.id"
              (click)="active.set(s.id)"
            >
              {{ s.label }}
            </button>
          }
        </nav>

        <div class="admin-glass-card rounded-xl p-6">
          @if (active() === 'general') {
            <form [formGroup]="generalForm" class="space-y-4" (ngSubmit)="saveGeneral()">
              <h2 class="font-semibold">General settings</h2>
              <p class="text-sm text-[var(--text-muted)]">For logo and hero, use <a href="/admin/website" class="text-indigo-600 underline">Website builder</a>.</p>
              <label class="block space-y-1"><span class="text-sm">Store name</span><input class="pf-editor-input w-full" formControlName="storeName" /></label>
              <label class="block space-y-1"><span class="text-sm">Tagline</span><input class="pf-editor-input w-full" formControlName="tagline" /></label>
              <label class="block space-y-1"><span class="text-sm">Description</span><textarea class="pf-editor-input w-full" formControlName="description"></textarea></label>
              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block space-y-1"><span class="text-sm">Timezone</span><input class="pf-editor-input w-full" formControlName="timezone" /></label>
                <label class="block space-y-1"><span class="text-sm">Currency</span><input class="pf-editor-input w-full" formControlName="currency" /></label>
              </div>
              <button type="submit" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm">Save</button>
            </form>
          }

          @if (active() === 'shipping') {
            <form [formGroup]="shippingForm" class="space-y-4" (ngSubmit)="saveShipping()">
              <h2 class="font-semibold">Shipping</h2>
              <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="enabled" /> Enable shipping</label>
              <label class="block space-y-1"><span class="text-sm">Default cost</span><input class="pf-editor-input w-full" type="number" formControlName="defaultShippingCost" /></label>
              <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="freeShippingEnabled" /> Free shipping over amount</label>
              <label class="block space-y-1"><span class="text-sm">Free shipping threshold</span><input class="pf-editor-input w-full" type="number" formControlName="freeShippingThreshold" /></label>
              <button type="submit" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm">Save</button>
            </form>
          }

          @if (active() === 'payment') {
            <form [formGroup]="paymentForm" class="space-y-4" (ngSubmit)="savePayment()">
              <h2 class="font-semibold">Payment methods</h2>
              <div class="grid gap-2 sm:grid-cols-2">
                <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="stripe" /> Stripe</label>
                <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="razorpay" /> Razorpay</label>
                <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="upi" /> UPI</label>
                <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="card" /> Card</label>
                <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="wallet" /> Wallet</label>
                <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="cod" /> COD</label>
              </div>
              <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="stripeTestMode" /> Stripe test mode</label>
              <label class="block space-y-1"><span class="text-sm">Stripe public key</span><input class="pf-editor-input w-full" formControlName="stripePublicKey" /></label>
              <label class="block space-y-1"><span class="text-sm">COD minimum order</span><input class="pf-editor-input w-full" type="number" formControlName="codMinOrder" /></label>
              <button type="submit" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm">Save</button>
            </form>
          }

          @if (active() === 'email') {
            <form [formGroup]="emailForm" class="space-y-4" (ngSubmit)="saveEmail()">
              <h2 class="font-semibold">Email (SMTP)</h2>
              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block space-y-1"><span class="text-sm">SMTP server</span><input class="pf-editor-input w-full" formControlName="smtpServer" /></label>
                <label class="block space-y-1"><span class="text-sm">Port</span><input class="pf-editor-input w-full" type="number" formControlName="smtpPort" /></label>
              </div>
              <label class="block space-y-1"><span class="text-sm">Username</span><input class="pf-editor-input w-full" formControlName="username" /></label>
              <label class="block space-y-1"><span class="text-sm">Password</span><input class="pf-editor-input w-full" type="password" formControlName="password" /></label>
              <label class="block space-y-1"><span class="text-sm">From email</span><input class="pf-editor-input w-full" formControlName="fromEmail" /></label>
              <label class="block space-y-1"><span class="text-sm">From name</span><input class="pf-editor-input w-full" formControlName="fromName" /></label>
              <button type="submit" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm">Save</button>
            </form>
          }

          @if (active() === 'tax') {
            <form [formGroup]="taxForm" class="space-y-4" (ngSubmit)="saveTax()">
              <h2 class="font-semibold">Tax</h2>
              <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="calculateTax" /> Calculate tax</label>
              <label class="block space-y-1"><span class="text-sm">Tax type</span>
                <select class="pf-editor-input w-full" formControlName="taxType">
                  <option value="GST">GST</option>
                  <option value="VAT">VAT</option>
                  <option value="Sales Tax">Sales Tax</option>
                </select>
              </label>
              <label class="block space-y-1"><span class="text-sm">Tax rate %</span><input class="pf-editor-input w-full" type="number" formControlName="taxRate" /></label>
              <label class="block space-y-1"><span class="text-sm">Tax ID</span><input class="pf-editor-input w-full" formControlName="taxId" /></label>
              <button type="submit" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm">Save</button>
            </form>
          }

          @if (active() === 'policies') {
            <form [formGroup]="policiesForm" class="space-y-4" (ngSubmit)="savePolicies()">
              <h2 class="font-semibold">Store policies</h2>
              @for (field of policyFields; track field.key) {
                <label class="block space-y-1">
                  <span class="text-sm">{{ field.label }}</span>
                  <textarea class="pf-editor-input w-full min-h-[80px]" [formControlName]="field.key"></textarea>
                </label>
              }
              <button type="submit" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm">Save</button>
            </form>
          }

          @if (active() === 'team') {
            <div>
              <h2 class="font-semibold">Team</h2>
              <ul class="mt-4 space-y-2">
                @for (m of settings()?.team ?? []; track m.id) {
                  <li class="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <span>{{ m.name }} ({{ m.email }})</span>
                    <span class="capitalize text-[var(--text-muted)]">{{ m.role }}</span>
                  </li>
                }
              </ul>
            </div>
          }

          @if (active() === 'integrations') {
            <div class="space-y-4">
              <h2 class="font-semibold">Integrations</h2>
              <div class="flex items-center justify-between rounded-lg border p-4">
                <span>Stripe</span>
                <span class="text-sm" [class.text-emerald-600]="settings()?.integrations?.stripeConnected"> {{ settings()?.integrations?.stripeConnected ? 'Connected' : 'Not connected' }}</span>
              </div>
              <div class="flex items-center justify-between rounded-lg border p-4">
                <span>Razorpay</span>
                <span class="text-sm">{{ settings()?.integrations?.razorpayConnected ? 'Connected' : 'Not connected' }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </app-admin-page-shell>
  `
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(SettingsService);

  readonly sections = SECTIONS;
  readonly active = signal<SettingsCategory>('general');
  readonly settings = signal<StoreSettings | null>(null);

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
    description: '',
    timezone: '',
    currency: ''
  });

  readonly shippingForm = this.fb.nonNullable.group({
    enabled: true,
    defaultShippingCost: 50,
    freeShippingEnabled: true,
    freeShippingThreshold: 500
  });

  readonly paymentForm = this.fb.nonNullable.group({
    stripe: true,
    razorpay: true,
    upi: true,
    card: true,
    wallet: false,
    cod: true,
    stripeTestMode: true,
    stripePublicKey: '',
    codMinOrder: 0
  });

  readonly emailForm = this.fb.nonNullable.group({
    smtpServer: '',
    smtpPort: 587,
    username: '',
    password: '',
    fromEmail: '',
    fromName: ''
  });

  readonly taxForm = this.fb.nonNullable.group({
    calculateTax: true,
    taxType: 'GST' as 'GST' | 'VAT' | 'Sales Tax',
    taxRate: 18,
    taxId: ''
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
      this.generalForm.patchValue(s.general);
      this.shippingForm.patchValue({
        enabled: s.shipping.enabled,
        defaultShippingCost: s.shipping.defaultShippingCost,
        freeShippingEnabled: s.shipping.freeShippingEnabled,
        freeShippingThreshold: s.shipping.freeShippingThreshold
      });
      this.paymentForm.patchValue(s.payment);
      this.emailForm.patchValue(s.email);
      this.taxForm.patchValue({
        calculateTax: s.tax.calculateTax,
        taxType: s.tax.taxType,
        taxRate: s.tax.taxRate,
        taxId: s.tax.taxId
      });
      this.policiesForm.patchValue(s.policies);
    });
  }

  saveGeneral(): void {
    const s = this.settings();
    if (!s) return;
    this.api.updateCategory('general', { ...s.general, ...this.generalForm.getRawValue() }).subscribe((u) => this.settings.set(u));
  }

  saveShipping(): void {
    const s = this.settings();
    if (!s) return;
    const v = this.shippingForm.getRawValue();
    this.api
      .updateCategory('shipping', { ...s.shipping, ...v })
      .subscribe((u) => this.settings.set(u));
  }

  savePayment(): void {
    const s = this.settings();
    if (!s) return;
    this.api.updateCategory('payment', { ...s.payment, ...this.paymentForm.getRawValue() }).subscribe((u) => this.settings.set(u));
  }

  saveEmail(): void {
    const s = this.settings();
    if (!s) return;
    this.api.updateCategory('email', { ...s.email, ...this.emailForm.getRawValue() }).subscribe((u) => this.settings.set(u));
  }

  saveTax(): void {
    const s = this.settings();
    if (!s) return;
    this.api.updateCategory('tax', { ...s.tax, ...this.taxForm.getRawValue() }).subscribe((u) => this.settings.set(u));
  }

  savePolicies(): void {
    const s = this.settings();
    if (!s) return;
    this.api.updateCategory('policies', { ...s.policies, ...this.policiesForm.getRawValue() }).subscribe((u) => this.settings.set(u));
  }
}
