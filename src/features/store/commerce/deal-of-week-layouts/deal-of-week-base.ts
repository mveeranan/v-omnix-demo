import { Directive, computed, inject, input, signal, OnInit, OnDestroy } from '@angular/core';
import { CatalogStorefrontApiService } from '@features/catalog/data-access/catalog-storefront-api.service';
import { CatalogDealOfWeekDto, catalogPrimaryImage, catalogDiscountPercent } from '@features/catalog/models/catalog-storefront.model';
import { Portfolio } from '../../../portfolio/models/portfolio.model';
import { CartStateService } from '../../data-access/cart-state.service';

export interface CountdownParts {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

/**
 * Shared data logic for every Deal of Week layout variant.
 *
 * Fetches active deals from the catalog API (independent of portfolio content
 * — deals are catalog-sourced), applies the admin's item limit/heading from
 * portfolio.dealOfWeek, and provides countdown timers + add-to-cart shared by
 * every layout.
 */
@Directive()
export abstract class DealOfWeekBase implements OnInit, OnDestroy {
  readonly portfolio = input.required<Portfolio>();
  readonly storeSlug = input<string>('');
  readonly enabled = input(true);

  protected readonly catalogApi = inject(CatalogStorefrontApiService);
  protected readonly cart = inject(CartStateService);

  protected readonly allDeals = signal<CatalogDealOfWeekDto[]>([]);
  private readonly now = signal(Date.now());
  private tickTimer?: ReturnType<typeof setInterval>;

  protected get section() {
    return this.portfolio().dealOfWeek;
  }

  get heading(): string | undefined {
    return this.section?.displayName?.trim() || undefined;
  }

  private get limit(): number | undefined {
    return this.section?.itemLimit;
  }

  readonly deals = computed<CatalogDealOfWeekDto[]>(() => {
    const valid = this.allDeals().filter((d) => d && d.enabled && d.product);
    return this.limit ? valid.slice(0, this.limit) : valid;
  });

  ngOnInit(): void {
    this.tickTimer = setInterval(() => this.now.set(Date.now()), 1000);

    this.catalogApi.getDealsCarousel(this.storeSlug()).subscribe({
      next: (carousel) => {
        if (carousel?.enabled && carousel.deals?.length) {
          const valid = carousel.deals.filter((d) => d && d.product);
          if (valid.length) {
            this.allDeals.set(valid);
            return;
          }
        }
        this.fetchSingleDeal();
      },
      error: () => this.fetchSingleDeal()
    });
  }

  ngOnDestroy(): void {
    if (this.tickTimer) clearInterval(this.tickTimer);
  }

  private fetchSingleDeal(): void {
    this.catalogApi.getDealOfWeek(this.storeSlug()).subscribe({
      next: (dto) => this.allDeals.set(dto?.enabled && dto.product ? [dto] : []),
      error: () => this.allDeals.set([])
    });
  }

  getCountdown(deal: CatalogDealOfWeekDto | undefined): CountdownParts {
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (!deal?.endDateUtc) return { days: '00', hours: '00', minutes: '00', seconds: '00' };

    const diff = Math.max(0, new Date(deal.endDateUtc).getTime() - this.now());
    return {
      days: pad(Math.floor(diff / 86400000)),
      hours: pad(Math.floor((diff % 86400000) / 3600000)),
      minutes: pad(Math.floor((diff % 3600000) / 60000)),
      seconds: pad(Math.floor((diff % 60000) / 1000))
    };
  }

  getPrimaryImage(product: any): string {
    return catalogPrimaryImage(product);
  }

  getDiscount(product: any): number | null {
    return catalogDiscountPercent(product);
  }

  getProductLink(deal: CatalogDealOfWeekDto): string[] {
    return ['/store', this.storeSlug(), 'products', deal.product!.slug];
  }

  addToCart(deal: CatalogDealOfWeekDto): void {
    if (deal?.product) this.cart.addListItem(deal.product, 1);
  }
}
