import { CurrencyPipe } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { ProductApiService } from '../data-access/product-api.service';
import { StoreProduct } from '../models/product.model';

@Component({
  selector: 'app-offer-banner-section',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    @if (portfolio().offerBanner.enabled && products().length) {
      <section class="mk-section">
        <div class="container mx-auto px-6">
          <div class="mk-offer-tiles">
            @for (product of products(); track product.id) {
              <a [routerLink]="productLink(product)" class="mk-offer-tile">
                <img [src]="product.imageUrl" [alt]="product.name" loading="lazy" />
                <div class="mk-offer-tile__overlay">
                  <span class="mk-offer-tile__title">{{ product.name }}</span>
                  <span class="mk-offer-tile__price">{{ product.price | currency: product.currency }}</span>
                </div>
              </a>
            }
          </div>
        </div>
      </section>
    }
  `
})
export class OfferBannerSectionComponent implements OnInit {
  readonly portfolio = input.required<Portfolio>();
  readonly storeSlug = input.required<string>();
  private readonly productApi = inject(ProductApiService);
  readonly products = signal<StoreProduct[]>([]);

  ngOnInit(): void {
    const ids = this.portfolio().offerBanner.productIds;
    if (!this.portfolio().offerBanner.enabled) return;

    this.productApi.listByStore(this.storeSlug()).subscribe({
      next: (result) => {
        const items = ids.length
          ? ids
              .map((id) => result.items.find((p) => p.id === id))
              .filter((p): p is StoreProduct => !!p)
              .slice(0, 2)
          : result.items.slice(0, 2);
        this.products.set(items);
      }
    });
  }

  productLink(product: StoreProduct): string[] {
    return ['/store', this.storeSlug(), 'products', product.slug];
  }
}
