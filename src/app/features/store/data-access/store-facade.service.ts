import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, catchError } from 'rxjs';
import { Portfolio, PortfolioStats } from '../../portfolio/models/portfolio.model';
import { PortfolioService } from '../../portfolio/data-access/portfolio.service';
import { BusinessProfileService } from '../../admin/data-access/business-profile.service';
import { BusinessProfileDto } from '../../admin/models/business-profile.model';
import {
  getCoverPreviewUrl,
  getLogoPreviewUrl
} from '../../admin/models/business-profile.model';
import { ProductApiService } from './product-api.service';
import { StoreProduct } from '../models/product.model';
import { AuthService } from '../../../core/auth/auth.service';

export interface StoreViewModel {
  portfolio: Portfolio;
  businessProfile: BusinessProfileDto | null;
}

@Injectable({ providedIn: 'root' })
export class StoreFacadeService {
  private readonly portfolioService = inject(PortfolioService);
  private readonly businessProfileService = inject(BusinessProfileService);
  private readonly productApi = inject(ProductApiService);
  private readonly authService = inject(AuthService);

  loadStoreBySlug(slug: string): Observable<StoreViewModel> {
    return this.portfolioService.getBySlug(slug).pipe(
      map((portfolio) => this.mergeBusinessProfile(portfolio, null)),
      catchError(() => {
        throw new Error('NOT_FOUND');
      })
    );
  }

  /** When tenant is logged in, hydrate brand/contact from live BusinessProfile API. */
  loadStoreWithProfile(slug: string): Observable<StoreViewModel> {
    const tenantId = this.authService.resolveTenantId();
    const portfolio$ = this.portfolioService.getBySlug(slug);

    if (!tenantId) {
      return portfolio$.pipe(map((portfolio) => this.mergeBusinessProfile(portfolio, null)));
    }

    const profile$ = this.businessProfileService.getByTenant(tenantId).pipe(catchError(() => of(null)));

    return forkJoin({ portfolio: portfolio$, profile: profile$ }).pipe(
      map(({ portfolio, profile }) => this.mergeBusinessProfile(portfolio, profile))
    );
  }

  getFeaturedProducts(storeSlug: string, limit = 6): Observable<StoreProduct[]> {
    return this.productApi.getFeatured(storeSlug, limit);
  }

  enrichStatsFromProducts(storeSlug: string, stats: PortfolioStats): Observable<PortfolioStats> {
    return this.productApi.listByStore(storeSlug, { pageSize: 500 }).pipe(
      map((result) => ({
        ...stats,
        totalProducts: result.total,
        totalOrders: stats.totalOrders ?? stats.ordersCompleted ?? stats.bookingsCompleted ?? 0,
        totalCustomers: stats.totalCustomers ?? stats.happyCustomers ?? 0
      }))
    );
  }

  private mergeBusinessProfile(
    portfolio: Portfolio,
    profile: BusinessProfileDto | null
  ): StoreViewModel {
    if (!profile) {
      return { portfolio: this.applyCommerceDefaults(portfolio), businessProfile: null };
    }

    const merged: Portfolio = {
      ...portfolio,
      brand: {
        ...portfolio.brand,
        businessName: profile.businessName || portfolio.brand.businessName,
        logoUrl: getLogoPreviewUrl(profile) || portfolio.brand.logoUrl
      },
      storeDescription: {
        ...portfolio.storeDescription,
        imageUrl:
          getCoverPreviewUrl(profile) ||
          portfolio.storeDescription.imageUrl ||
          portfolio.brand.coverImageUrl ||
          ''
      },
      about: {
        ...portfolio.about,
        description: profile.description?.trim() || portfolio.about.description
      },
      contact: {
        ...portfolio.contact,
        enabled: true,
        email: profile.email?.trim() || portfolio.contact.email,
        phone: profile.phone?.trim() || portfolio.contact.phone
      }
    };

    return {
      portfolio: this.applyCommerceDefaults(merged),
      businessProfile: profile
    };
  }

  private applyCommerceDefaults(portfolio: Portfolio): Portfolio {
    const highlights =
      portfolio.highlights.items.length > 0
        ? portfolio.highlights
        : {
            ...portfolio.highlights,
            title: 'Why choose us',
            items: [
              { text: 'Authentic Products', iconId: 'sparkles' },
              { text: 'Fast Delivery', iconId: 'truck' },
              { text: 'Secure Payments', iconId: 'shield' },
              { text: 'Customer Support', iconId: 'heart' }
            ]
          };

    return {
      ...portfolio,
      cta: {
        ...portfolio.cta,
        label: portfolio.cta.label === 'Book now' ? 'Shop Now' : portfolio.cta.label || 'Shop Now',
        type: portfolio.cta.type === 'whatsapp' ? 'internal' : portfolio.cta.type
      },
      highlights,
      team: { ...portfolio.team, enabled: false },
      stats: {
        ...portfolio.stats,
        totalProducts: portfolio.stats.totalProducts ?? 0,
        totalOrders:
          portfolio.stats.totalOrders ??
          portfolio.stats.ordersCompleted ??
          portfolio.stats.bookingsCompleted ??
          0,
        totalCustomers: portfolio.stats.totalCustomers ?? portfolio.stats.happyCustomers ?? 0
      }
    };
  }
}
