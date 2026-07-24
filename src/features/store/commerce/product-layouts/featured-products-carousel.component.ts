import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../product-card.component';
import { FeaturedProductsBase } from './featured-products-base';

/** Horizontal Scroll Carousel — a swipeable row of product cards. */
@Component({
  selector: 'app-featured-products-carousel',
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
            <div class="fp-carousel">
              @for (i of [1, 2, 3, 4]; track i) {
                <div class="fp-carousel__cell mox-skeleton h-80 animate-pulse"></div>
              }
            </div>
          } @else if (products().length) {
            <div class="fp-carousel" role="list">
              @for (product of products(); track product.id) {
                <div class="fp-carousel__cell" role="listitem">
                  <app-product-card [product]="product" [storeSlug]="storeSlug()" />
                </div>
              }
            </div>
          } @else {
            <p class="text-center text-sm text-[var(--mox-muted)]">Pin products in Website → Featured products.</p>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .fp-carousel {
      display: flex;
      gap: 1.25rem;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: 1rem;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }
    .fp-carousel__cell {
      flex: 0 0 auto;
      width: 16rem;
      scroll-snap-align: start;
    }
    @media (max-width: 640px) {
      .fp-carousel__cell { width: 72vw; }
    }
  `
})
export class FeaturedProductsCarouselComponent extends FeaturedProductsBase {}
