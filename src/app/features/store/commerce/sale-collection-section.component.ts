import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { ProductApiService } from '../data-access/product-api.service';
import { StoreProduct } from '../models/product.model';
import { ProductCardComponent } from './product-card.component';

@Component({
  selector: 'app-sale-collection-section',
  standalone: true,
  imports: [ProductCardComponent],
  template: `
    @if (portfolio().saleCollection.enabled) {
      <section class="mox-sale-section">
        <div class="container mx-auto px-6">
          <header class="mox-sale-section__header">
            <h2 class="mox-sale-section__title">{{ portfolio().saleCollection.title }}</h2>
            <p class="mox-sale-section__subtitle">{{ portfolio().saleCollection.subtitle }}</p>
          </header>
          @if (products().length) {
            <div class="mox-product-grid--scroll">
              @for (product of products(); track product.id) {
                <app-product-card
                  [product]="product"
                  [storeSlug]="storeSlug()"
                  [promoMarquee]="portfolio().featuredProducts.promoMarqueeText"
                  [showQtyControls]="portfolio().featuredProducts.showQtyControls"
                />
              }
            </div>
          }
        </div>
      </section>
    }
  `
})
export class SaleCollectionSectionComponent implements OnInit {
  readonly portfolio = input.required<Portfolio>();
  readonly storeSlug = input.required<string>();
  private readonly productApi = inject(ProductApiService);
  readonly products = signal<StoreProduct[]>([]);

  ngOnInit(): void {
    if (!this.portfolio().saleCollection.enabled) return;
    const sc = this.portfolio().saleCollection;
    const ids = sc.productIds;

    this.productApi.listByStore(this.storeSlug()).subscribe({
      next: (result) => {
        const items = ids.length
          ? ids
              .map((id) => result.items.find((p) => p.id === id))
              .filter((p): p is StoreProduct => !!p)
              .slice(0, sc.maxCount)
          : result.items.slice(0, sc.maxCount);
        this.products.set(items);
      }
    });
  }
}
