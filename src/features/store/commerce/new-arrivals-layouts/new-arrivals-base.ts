import { Directive, computed, inject, input, signal, OnInit } from '@angular/core';
import { Portfolio } from '../../../portfolio/models/portfolio.model';
import { ProductApiService } from '../../data-access/product-api.service';
import { CatalogProductListItemDto } from '@features/catalog/models/catalog-storefront.model';

/**
 * Shared data logic for every New Arrivals layout variant.
 *
 * Reads its config from portfolio.newArrivals (title, item limit, layout
 * style), fetches the newest products once, and applies the item limit.
 * Concrete layouts extend this and provide only template + styles.
 */
@Directive()
export abstract class NewArrivalsBase implements OnInit {
  readonly portfolio = input.required<Portfolio>();
  readonly storeSlug = input.required<string>();
  readonly enabled = input(true);

  protected readonly productApi = inject(ProductApiService);
  protected readonly allProducts = signal<CatalogProductListItemDto[]>([]);
  readonly loading = signal(true);

  protected get section() {
    return this.portfolio().newArrivals;
  }

  /** Heading: admin's custom display name, else the stored title. */
  get heading(): string {
    return this.section.displayName?.trim() || this.section.title;
  }

  private get limit(): number {
    return this.section.itemLimit ?? this.section.maxCount ?? 8;
  }

  ngOnInit(): void {
    if (!this.enabled() || !this.section.enabled) {
      this.loading.set(false);
      return;
    }
    this.productApi
      .listByStore(this.storeSlug(), { page: 1, pageSize: this.limit, sort: 'newest' })
      .subscribe({
        next: (res) => {
          this.allProducts.set(res.items ?? []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  /** Products to display, sliced to the admin's item limit (defensive — the API call is already page-sized to it). */
  readonly products = computed<CatalogProductListItemDto[]>(() =>
    this.allProducts().slice(0, this.limit)
  );
}
