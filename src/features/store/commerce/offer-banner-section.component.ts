import { CurrencyPipe } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { ProductApiService } from '../data-access/product-api.service';
import {
  CatalogProductListItemDto,
  catalogPrimaryImage
} from '@features/catalog/models/catalog-storefront.model';

@Component({
  selector: 'app-offer-banner-section',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    @if (portfolio().offerBanner.enabled && products().length) {
      <section class="mox-section">
        <div class="container mx-auto px-6">
          <div class="mox-offer-tiles">
            @for (product of products(); track product.id) {
              <a [routerLink]="productLink(product)" class="mox-offer-tile">
                <img [src]="imageUrl(product)" [alt]="product.name" loading="lazy" />
                <div class="mox-offer-tile__overlay">
                  <span class="mox-offer-tile__title">{{ product.name }}</span>
                  <span class="mox-offer-tile__price">{{ product.price | currency: 'USD' }}</span>
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
  readonly products = signal<CatalogProductListItemDto[]>([]);

  ngOnInit(): void {
    const ids = this.portfolio().offerBanner.productIds;
    if (!this.portfolio().offerBanner.enabled) return;

    this.productApi.listByStore(this.storeSlug()).subscribe({
      next: (result) => {
        const items = ids.length
          ? ids
              .map((id) => result.items.find((p) => p.id === id))
              .filter((p): p is CatalogProductListItemDto => !!p)
              .slice(0, 2)
          : result.items.slice(0, 2);
        this.products.set(items);
      }
    });
  }

  imageUrl(product: CatalogProductListItemDto): string {
    return catalogPrimaryImage(product);
  }

  productLink(product: CatalogProductListItemDto): string[] {
    return ['/store', this.storeSlug(), 'products', product.slug];
  }
}
