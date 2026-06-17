import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AdminPageShellComponent } from '@features/admin/shared/admin-page-shell.component';
import { LoadingSpinnerComponent } from '@shared/ui/loading-spinner.component';
import { SubscriptionService } from '../data-access/subscription.service';
import { TenantSubscription } from '../models/subscription.model';
import { BillingCycle } from '@shared/models/backend-enums';
import { NotificationService } from '@core/notifications/notification.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [ReactiveFormsModule, AdminPageShellComponent, LoadingSpinnerComponent],
  template: `
    <app-admin-page-shell
      eyebrow="Account"
      title="Billing"
      description="Your WorkOrbit SaaS subscription and plan details."
    >
      @if (loading()) {
        <app-loading-spinner label="Loading subscription…" />
      } @else if (subscription()) {
        <div class="grid gap-4 lg:grid-cols-2">
          <div class="admin-glass-card rounded-xl p-6">
            <p class="text-xs uppercase tracking-wide text-[var(--text-muted)]">Current plan</p>
            <h2 class="mt-1 text-2xl font-bold">{{ subscription()!.planType }}</h2>
            <p class="mt-1 text-sm text-[var(--text-secondary)]">
              Status:
              <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium capitalize dark:bg-emerald-900/40">
                {{ subscription()!.status }}
              </span>
            </p>
            <p class="mt-4 text-3xl font-bold">
              {{ formatPrice(currentPrice()) }}
              <span class="text-sm font-normal text-[var(--text-muted)]">/ {{ billingCycleLabel() }}</span>
            </p>
            <p class="mt-2 text-sm text-[var(--text-muted)]">
              Billing period: {{ formatDate(subscription()!.currentPeriodStart) }} –
              {{ formatDate(subscription()!.currentPeriodEnd) }}
            </p>
            @if (subscription()!.cancelAtPeriodEnd) {
              <p class="mt-3 text-sm text-amber-600">Subscription will cancel at end of billing period.</p>
            }
          </div>

          <div class="admin-glass-card rounded-xl p-6">
            <h3 class="font-semibold">Plan includes</h3>
            <ul class="mt-3 space-y-2 text-sm">
              @for (feature of subscription()!.features; track feature) {
                <li class="flex items-start gap-2">
                  <span class="text-emerald-500">✓</span>
                  <span>{{ feature }}</span>
                </li>
              }
            </ul>
          </div>
        </div>

        <div class="admin-glass-card mt-6 rounded-xl p-6">
          <h3 class="font-semibold">Billing preferences</h3>
          <form class="mt-4 grid gap-4 sm:grid-cols-2" [formGroup]="form" (ngSubmit)="save()">
            <label class="block space-y-1">
              <span class="text-sm font-medium">Billing cycle</span>
              <select class="pf-editor-input w-full" formControlName="billingCycle">
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly (save ~17%)</option>
              </select>
            </label>
            <label class="flex items-end gap-2 pb-1 text-sm">
              <input type="checkbox" formControlName="cancelAtPeriodEnd" />
              Cancel at end of period
            </label>
            <div class="sm:col-span-2">
              <button type="submit" class="admin-section-action-btn rounded-lg px-4 py-2 text-sm" [disabled]="saving()">
                {{ saving() ? 'Saving…' : 'Update billing' }}
              </button>
            </div>
          </form>
        </div>
      }
    </app-admin-page-shell>
  `
})
export class BillingComponent implements OnInit {
  private readonly api = inject(SubscriptionService);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly subscription = signal<TenantSubscription | null>(null);

  readonly form = this.fb.nonNullable.group({
    billingCycle: ['Monthly' as BillingCycle],
    cancelAtPeriodEnd: [false]
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.getSubscription().subscribe({
      next: (sub) => {
        this.subscription.set(sub);
        this.form.patchValue({
          billingCycle: sub.billingCycle,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  currentPrice(): number {
    const sub = this.subscription();
    if (!sub) return 0;
    return sub.billingCycle === 'Yearly' ? sub.priceYearly : sub.priceMonthly;
  }

  billingCycleLabel(): string {
    return this.subscription()?.billingCycle === 'Yearly' ? 'year' : 'month';
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amount);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  save(): void {
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.api.updateBillingCycle(v.billingCycle).subscribe({
      next: (sub) => {
        this.api.setCancelAtPeriodEnd(v.cancelAtPeriodEnd).subscribe({
          next: (updated) => {
            this.subscription.set(updated);
            this.saving.set(false);
            this.notifications.success('Billing preferences updated');
          },
          error: () => this.saving.set(false)
        });
      },
      error: () => this.saving.set(false)
    });
  }
}
