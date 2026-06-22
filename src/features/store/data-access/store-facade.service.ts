import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { Portfolio, PortfolioStats } from '@features/portfolio/models/portfolio.model';
import { PortfolioApiService } from '@features/portfolio/data-access/portfolio-api.service';
import { BusinessProfileDto } from '@features/admin/models/business-profile.model';
import { mergeBusinessProfileIntoPortfolio } from '@features/portfolio/data-access/business-profile-portfolio.util';
import { ThemePresetsService } from '@features/portfolio/data-access/theme-presets.service';
import { ProductApiService } from './product-api.service';
import { CatalogProductListItemDto } from '@features/catalog/models/catalog-storefront.model';
import { AuthService } from '@core/auth/auth.service';

export interface StoreViewModel {
  portfolio: Portfolio;
  businessProfile: BusinessProfileDto | null;
}

@Injectable({ providedIn: 'root' })
export class StoreFacadeService {
  private readonly portfolioApiService = inject(PortfolioApiService);
  private readonly productApi = inject(ProductApiService);
  private readonly authService = inject(AuthService);
  private readonly themePresets = inject(ThemePresetsService);

  loadStoreBySlug(slug: string): Observable<StoreViewModel> {
    return this.themePresets.list().pipe(
      switchMap(() =>
        this.portfolioApiService.getBySlug(slug).pipe(
          map((result) => {
            if (!result.portfolio?.published) {
              throw new Error('NOT_FOUND');
            }
            return this.mergeBusinessProfile(result.portfolio, result.businessProfile);
          })
        )
      )
    );
  }

  loadStoreWithProfile(slug: string): Observable<StoreViewModel> {
    return this.themePresets.list().pipe(switchMap(() => this.loadStoreWithProfileInner(slug)));
  }

  private loadStoreWithProfileInner(slug: string): Observable<StoreViewModel> {
    const tenantId = this.authService.resolveTenantId();

    if (tenantId) {
      return this.portfolioApiService.getByTenant(tenantId).pipe(
        map(({ portfolio, businessProfile }) => {
          if (!portfolio) {
            throw new Error('NOT_FOUND');
          }
          return this.mergeBusinessProfile(portfolio, businessProfile);
        })
      );
    }

    return this.portfolioApiService.getBySlug(slug).pipe(
      map(({ portfolio, businessProfile }) => {
        if (!portfolio) {
          throw new Error('NOT_FOUND');
        }
        return this.mergeBusinessProfile(portfolio, businessProfile);
      })
    );
  }

  getFeaturedProducts(storeSlug: string, limit = 6): Observable<CatalogProductListItemDto[]> {
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

    return {
      portfolio: this.applyCommerceDefaults(
        mergeBusinessProfileIntoPortfolio(portfolio, profile, this.themePresets.getCatalog())
      ),
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
