import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ADMIN_NAV_ITEMS } from '../config/admin-nav.config';
import { AdminPageShellComponent } from '../shared/admin-page-shell.component';
import { AdminSectionPlaceholderComponent } from '../shared/admin-section-placeholder.component';

const ACTION_LABELS: Record<string, string> = {
  products: 'Add product',
  orders: 'New order',
  customers: 'Add customer',
  website: 'Configure website',
  payments: 'Create invoice',
  settings: 'Open preferences'
};

const PLACEHOLDER_IDS = new Set(['products', 'orders', 'customers', 'website', 'payments', 'settings']);

@Component({
  selector: 'app-admin-section-page',
  standalone: true,
  imports: [AdminPageShellComponent, AdminSectionPlaceholderComponent],
  template: `
    @if (section(); as s) {
      <app-admin-page-shell [eyebrow]="s.label" [title]="s.label" [description]="s.description">
        <app-admin-section-placeholder [icon]="s.icon" [actionLabel]="actionLabel()" />
      </app-admin-page-shell>
    }
  `
})
export class AdminSectionPageComponent {
  private readonly router = inject(Router);
  private readonly currentUrl = signal(this.router.url);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.currentUrl.set(this.router.url));
  }

  readonly section = computed(() => {
    const segments = this.currentUrl().split('?')[0].split('/').filter(Boolean);
    const adminIndex = segments.indexOf('admin');
    const segment = adminIndex >= 0 ? segments[adminIndex + 1] : segments.pop();
    if (!segment || !PLACEHOLDER_IDS.has(segment)) {
      return null;
    }
    return ADMIN_NAV_ITEMS.find((item) => item.path === segment) ?? null;
  });

  readonly actionLabel = computed(() => {
    const id = this.section()?.id;
    return id ? (ACTION_LABELS[id] ?? 'Get started') : 'Get started';
  });
}
