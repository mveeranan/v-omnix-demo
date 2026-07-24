import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FeaturedProductsBase } from './featured-products-base';

/** Masonry — mixed-height product tiles (every 3rd tile taller), image-forward. */
@Component({
  selector: 'app-featured-products-masonry',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
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

          @if (products().length) {
            <div class="fp-masonry">
              @for (product of products(); track product.id; let i = $index) {
                <a class="fp-masonry__tile"
                  [class.fp-masonry__tile--tall]="i % 3 === 0"
                  [routerLink]="['/store', storeSlug(), 'products', product.slug]"
                  [style.background-image]="product.primaryImageUrl ? 'url(' + product.primaryImageUrl + ')' : null"
                >
                  <span class="fp-masonry__info">
                    <span class="fp-masonry__name">{{ product.name }}</span>
                    <span class="fp-masonry__price">{{ product.price | currency }}</span>
                  </span>
                </a>
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
    .fp-masonry {
      column-count: 2;
      column-gap: 1.25rem;
    }
    @media (min-width: 768px) { .fp-masonry { column-count: 3; } }
    @media (min-width: 1100px) { .fp-masonry { column-count: 4; } }

    .fp-masonry__tile {
      position: relative;
      display: flex;
      align-items: flex-end;
      break-inside: avoid;
      margin-bottom: 1.25rem;
      height: 14rem;
      border-radius: var(--mox-radius, 6px);
      overflow: hidden;
      text-decoration: none;
      background-color: var(--mox-surface, #f0f0f0);
      background-size: cover;
      background-position: center;
    }
    .fp-masonry__tile--tall { height: 20rem; }
    .fp-masonry__tile::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 55%);
    }
    .fp-masonry__info {
      position: relative; z-index: 1;
      display: flex; flex-direction: column; gap: 0.2rem;
      padding: 0.9rem; width: 100%;
      color: #fff;
    }
    .fp-masonry__name { font-size: 0.9rem; font-weight: 700; }
    .fp-masonry__price { font-size: 0.85rem; font-weight: 600; opacity: 0.9; }
  `
})
export class FeaturedProductsMasonryComponent extends FeaturedProductsBase {}
