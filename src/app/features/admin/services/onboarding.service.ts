import { Injectable, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminProfileStateService } from '../data-access/admin-profile-state.service';
import { BusinessProfileExtensionService } from '../data-access/business-profile-extension.service';
import { AuthService } from '../../../core/auth/auth.service';
import { productCatalogStore } from '../../store/data-access/product-catalog.store';
import { categoryStore } from '../data-access/category.store';
import { ecommerceConfigStore } from '../data-access/ecommerce-config.store';

export interface OnboardingStep {
  id: string;
  label: string;
  done: boolean;
  route: string;
}

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly profileState = inject(AdminProfileStateService);
  private readonly extService = inject(BusinessProfileExtensionService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly refreshTick = signal(0);

  readonly steps = computed((): OnboardingStep[] => {
    this.refreshTick();
    const tenantId = this.authService.resolveTenantId() ?? '';
    const profile = this.profileState.profile();
    const ext = this.extService.load(tenantId);
    const slug = ext.businessSlug || 'my-store';

    return [
      {
        id: 'profile',
        label: 'Complete profile',
        done: Boolean(profile?.businessName?.trim() && profile?.businessTypeId),
        route: '/admin/profile'
      },
      {
        id: 'slug',
        label: 'Set store slug & publish',
        done: Boolean(ext.businessSlug.trim() && ext.isPublished),
        route: '/admin/profile'
      },
      {
        id: 'website',
        label: 'Build website',
        done: this.hasWebsiteDraft(),
        route: '/admin/website'
      },
      {
        id: 'category',
        label: 'Add a category',
        done: categoryStore.getAll().length > 0,
        route: '/admin/categories'
      },
      {
        id: 'product',
        label: 'Add first product',
        done: productCatalogStore.getAll().length > 0,
        route: '/admin/products/new'
      },
      {
        id: 'settings',
        label: 'Configure store settings',
        done: ecommerceConfigStore.isConfigured(),
        route: '/admin/settings'
      },
      {
        id: 'store',
        label: 'View live store',
        done: ext.isPublished && ext.enableEcommerce,
        route: `/store/${slug}`
      }
    ];
  });

  readonly completionPercent = computed(() => {
    const list = this.steps();
    const done = list.filter((s) => s.done).length;
    return Math.round((done / list.length) * 100);
  });

  refresh(): void {
    this.refreshTick.update((n) => n + 1);
  }

  navigate(step: OnboardingStep): void {
    if (step.route.startsWith('/store/')) {
      window.open(step.route, '_blank');
      return;
    }
    void this.router.navigateByUrl(step.route);
  }

  private hasWebsiteDraft(): boolean {
    try {
      const raw = localStorage.getItem('work-orbit.portfolio.draft');
      return Boolean(raw && raw.length > 50);
    } catch {
      return false;
    }
  }
}
