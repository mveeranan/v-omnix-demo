import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../product-card.component';
import { FeaturedProductsBase } from './featured-products-base';

/** Large Hero Product + Grid — first product large/featured, rest in a small grid below. */
@Component({
  selector: 'app-featured-products-hero-grid',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, CurrencyPipe],
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
            <div class="fp-hero-layout">
              <a class="fp-hero-layout__spotlight"
                [routerLink]="['/store', storeSlug(), 'products', products()[0].slug]"
                [style.background-image]="products()[0].primaryImageUrl ? 'url(' + products()[0].primaryImageUrl + ')' : null"
              >
                <span class="fp-hero-layout__spotlight-info">
                  @if (products()[0].brandName) {
                    <span class="fp-hero-layout__brand">{{ products()[0].brandName }}</span>
                  }
                  <span class="fp-hero-layout__name">{{ products()[0].name }}</span>
                  <span class="fp-hero-layout__price">{{ products()[0].price | currency }}</span>
                </span>
              </a>
              @if (products().length > 1) {
                <div class="fp-hero-layout__grid">
                  @for (product of products().slice(1); track product.id) {
                    <app-product-card [product]="product" [storeSlug]="storeSlug()" />
                  }
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
    .fp-hero-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (min-width: 900px) {
      .fp-hero-layout { grid-template-columns: 1.2fr 1fr; align-items: stretch; }
    }
    .fp-hero-layout__spotlight {
      position: relative;
      display: flex;
      align-items: flex-end;
      min-height: 22rem;
      border-radius: var(--mox-radius, 8px);
      overflow: hidden;
      text-decoration: none;
      background-color: var(--mox-surface, #f0f0f0);
      background-size: cover;
      background-position: center;
    }
    .fp-hero-layout__spotlight::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 55%);
    }
    .fp-hero-layout__spotlight-info {
      position: relative; z-index: 1;
      display: flex; flex-direction: column; gap: 0.3rem;
      padding: 1.5rem;
      color: #fff;
    }
    .fp-hero-layout__brand { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.85; }
    .fp-hero-layout__name { font-size: 1.4rem; font-weight: 700; }
    .fp-hero-layout__price { font-size: 1.1rem; font-weight: 600; }
    .fp-hero-layout__grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
  `
})
export class FeaturedProductsHeroGridComponent extends FeaturedProductsBase {}
