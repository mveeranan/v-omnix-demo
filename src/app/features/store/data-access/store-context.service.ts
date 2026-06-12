import { Injectable, inject, signal } from '@angular/core';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { BusinessProfileDto } from '../../admin/models/business-profile.model';
import { StoreFacadeService } from './store-facade.service';
import { CartStateService } from './cart-state.service';

@Injectable()
export class StoreContextService {
  private readonly facade = inject(StoreFacadeService);
  private readonly cart = inject(CartStateService);

  readonly slug = signal('');
  readonly portfolio = signal<Portfolio | null>(null);
  readonly businessProfile = signal<BusinessProfileDto | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly previewMode = signal(false);

  load(slug: string, previewPortfolio?: Portfolio | null): void {
    this.slug.set(slug);
    this.cart.setStoreSlug(slug);

    if (previewPortfolio) {
      this.previewMode.set(true);
      this.portfolio.set(previewPortfolio);
      this.loading.set(false);
      this.notFound.set(false);
      return;
    }

    this.loading.set(true);
    this.notFound.set(false);

    this.facade.loadStoreWithProfile(slug).subscribe({
      next: (vm) => {
        this.portfolio.set(vm.portfolio);
        this.businessProfile.set(vm.businessProfile);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      }
    });
  }
}
