import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FeaturedProductsBase } from './featured-products-base';

/** Compact List — image / name / brand / price rows, image-light and scannable. */
@Component({
  selector: 'app-featured-products-compact-list',
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
            <ul class="fp-list">
              @for (product of products(); track product.id) {
                <li>
                  <a class="fp-list__row" [routerLink]="['/store', storeSlug(), 'products', product.slug]">
                    <span class="fp-list__media"
                      [style.background-image]="product.primaryImageUrl ? 'url(' + product.primaryImageUrl + ')' : null"></span>
                    <span class="fp-list__info">
                      <span class="fp-list__name">{{ product.name }}</span>
                      @if (product.brandName) {
                        <span class="fp-list__brand">{{ product.brandName }}</span>
                      }
                    </span>
                    <span class="fp-list__price">
                      <span class="fp-list__price-now">{{ product.price | currency }}</span>
                      @if (product.compareAtPrice && product.compareAtPrice > product.price) {
                        <span class="fp-list__price-was">{{ product.compareAtPrice | currency }}</span>
                      }
                    </span>
                  </a>
                </li>
              }
            </ul>
          } @else {
            <p class="text-center text-sm text-[var(--mox-muted)]">Pin products in Website → Featured products.</p>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .fp-list {
      list-style: none;
      margin: 0;
      padding: 0;
      max-width: 52rem;
      border-top: 1px solid var(--mox-border, #eaeaea);
    }
    .fp-list__row {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1rem 0.75rem;
      border-bottom: 1px solid var(--mox-border, #eaeaea);
      text-decoration: none;
      transition: background 0.2s ease;
    }
    .fp-list__row:hover { background: var(--mox-surface, #f7f7f7); }
    .fp-list__media {
      flex: 0 0 auto;
      width: 4rem;
      height: 4rem;
      border-radius: var(--mox-radius, 6px);
      background-color: var(--mox-surface, #f0f0f0);
      background-size: cover;
      background-position: center;
    }
    .fp-list__info { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
    .fp-list__name { font-size: 0.95rem; font-weight: 700; color: var(--mox-text, #23232d); }
    .fp-list__brand { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--mox-muted, #8a8a8a); }
    .fp-list__price { display: flex; flex-direction: column; align-items: flex-end; }
    .fp-list__price-now { font-size: 0.95rem; font-weight: 700; color: var(--mox-text, #23232d); }
    .fp-list__price-was { font-size: 0.8rem; text-decoration: line-through; color: var(--mox-muted, #8a8a8a); }
  `
})
export class FeaturedProductsCompactListComponent extends FeaturedProductsBase {}
