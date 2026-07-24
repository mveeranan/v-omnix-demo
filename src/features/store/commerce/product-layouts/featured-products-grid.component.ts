import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../product-card.component';
import { FeaturedProductsBase } from './featured-products-base';

/** Standard Grid — the default product grid (matches the original appearance). */
@Component({
  selector: 'app-featured-products-grid',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    @if (enabled() && section.enabled) {
      <section class="mox-section" id="products">
        <div class="container mx-auto px-6">
          <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p class="mox-hero__eyebrow">Top picks</p>
              <h2 class="mox-sale-section__title">{{ heading }}</h2>
              <p class="mox-sale-section__subtitle mt-1 text-left">Highlight your best sellers on your company website.</p>
            </div>
            <a [routerLink]="shopLink()" class="mox-btn mox-btn--outline text-sm">View all in shop</a>
          </header>

          @if (loading()) {
            <div class="mox-product-grid">
              @for (i of [1, 2, 3, 4]; track i) {
                <div class="mox-product-card mox-skeleton h-80 animate-pulse"></div>
              }
            </div>
          } @else if (products().length) {
            <div class="mox-product-grid">
              @for (product of products(); track product.id) {
                <app-product-card [product]="product" [storeSlug]="storeSlug()" />
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
export class FeaturedProductsGridComponent extends FeaturedProductsBase {}
