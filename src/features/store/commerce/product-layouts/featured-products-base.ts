import { Directive, computed, inject, input, signal, OnInit } from '@angular/core';
import { Portfolio } from '../../../portfolio/models/portfolio.model';
import { ProductApiService } from '../../data-access/product-api.service';
import { CatalogProductListItemDto } from '@features/catalog/models/catalog-storefront.model';

/**
 * Shared data logic for every Featured Products layout variant.
 *
 * Reads its config from portfolio.featuredProducts (pinned ids, item limit,
 * heading, layout style), fetches the products once, and applies the item
 * limit. Concrete layouts extend this and provide only template + styles.
 */
@Directive()
export abstract class FeaturedProductsBase implements OnInit {
  readonly portfolio = input.required<Portfolio>();
  readonly storeSlug = input.required<string>();
  readonly enabled = input(true);

  protected readonly productApi = inject(ProductApiService);
  protected readonly allProducts = signal<CatalogProductListItemDto[]>([]);
  readonly loading = signal(true);

  protected get section() {
    return this.portfolio().featuredProducts;
  }

  /** Heading: admin's custom display name, else the default label. */
  get heading(): string {
    return this.section.displayName?.trim() || 'Featured products';
  }

  private get limit(): number {
    return this.section.itemLimit ?? this.section.maxCount ?? 12;
  }

  shopLink(): string[] {
    return ['/store', this.storeSlug(), 'products'];
  }

  ngOnInit(): void {
    if (!this.enabled() || !this.section.enabled) {
      this.loading.set(false);
      return;
    }

    const ids = this.section.productIds ?? [];
    if (ids.length > 0) {
      this.productApi.listByStore(this.storeSlug()).subscribe({
        next: (result) => {
          const pinned = ids
            .map((id) => result.items.find((item) => item.id === id))
            .filter((item): item is CatalogProductListItemDto => !!item);
          this.allProducts.set(pinned);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
      return;
    }

    this.productApi.getFeatured(this.storeSlug(), this.limit).subscribe({
      next: (items) => {
        this.allProducts.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  /** Products to display, sliced to the admin's item limit. */
  readonly products = computed<CatalogProductListItemDto[]>(() =>
    this.allProducts().slice(0, this.limit)
  );
}
