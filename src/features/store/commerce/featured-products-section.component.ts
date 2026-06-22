import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductApiService } from '../data-access/product-api.service';
import { CatalogProductListItemDto } from '@features/catalog/models/catalog-storefront.model';
import { ProductCardComponent } from './product-card.component';
import { Portfolio } from '../../portfolio/models/portfolio.model';

@Component({
  selector: 'app-featured-products-section',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    @if (enabled()) {
    <section class="mox-section" id="products">
      <div class="container mx-auto px-6">
        <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="mox-hero__eyebrow">Top picks</p>
            <h2 class="mox-sale-section__title">Featured products</h2>
            <p class="mox-sale-section__subtitle mt-1 text-left">Highlight your best sellers on your company website.</p>
          </div>
          @if (showShopCta()) {
            <a [routerLink]="shopLink()" class="mox-btn mox-btn--outline text-sm">View all in shop</a>
          }
        </header>

        @if (loading()) {
          <div class="mox-product-grid">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="mox-product-card h-80 animate-pulse bg-[#f0f0f0]"></div>
            }
          </div>
        } @else if (products().length) {
          <div class="mox-product-grid">
            @for (product of products(); track product.id) {
              <app-product-card
                [product]="product"
                [storeSlug]="storeSlug()"
                [promoMarquee]="promoMarquee()"
                [showQtyControls]="showQtyControls()"
              />
            }
          </div>
        } @else {
          <p class="text-center text-sm text-[var(--mox-muted)]">Pin products in Website → Featured products.</p>
        }
      </div>
    </section>
    }
  `
})
export class FeaturedProductsSectionComponent implements OnInit {
  readonly storeSlug = input.required<string>();
  readonly portfolio = input<Portfolio | null>(null);
  readonly enabled = input(true);
  readonly maxCount = input(12);
  readonly productIds = input<string[]>([]);
  readonly promoMarquee = input('');
  readonly showQtyControls = input(false);
  readonly showShopCta = input(false);

  private readonly productApi = inject(ProductApiService);

  readonly products = signal<CatalogProductListItemDto[]>([]);
  readonly loading = signal(true);

  shopLink(): string[] {
    return ['/store', this.storeSlug(), 'products'];
  }

  ngOnInit(): void {
    if (!this.enabled()) {
      this.loading.set(false);
      return;
    }

    const ids = this.productIds();
    if (ids.length > 0) {
      this.productApi.listByStore(this.storeSlug()).subscribe({
        next: (result) => {
          const pinned = ids
            .map((id) => result.items.find((item) => item.id === id))
            .filter((item): item is CatalogProductListItemDto => !!item)
            .slice(0, this.maxCount());
          this.products.set(pinned);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
      return;
    }

    this.productApi.getFeatured(this.storeSlug(), this.maxCount()).subscribe({
      next: (items) => {
        this.products.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
