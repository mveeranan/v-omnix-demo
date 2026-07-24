import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NewArrivalsBase } from './new-arrivals-base';

/** Masonry — mixed-height image tiles, each stamped "New". */
@Component({
  selector: 'app-new-arrivals-masonry',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    @if (enabled() && section.enabled) {
      <section class="mox-section" id="new-arrivals">
        <div class="container mx-auto px-6">
          <header class="mb-8 text-center">
            <h2 class="mox-sale-section__title">{{ heading }}</h2>
          </header>

          @if (products().length) {
            <div class="na-masonry">
              @for (product of products(); track product.id; let i = $index) {
                <a class="na-masonry__tile"
                  [class.na-masonry__tile--tall]="i % 3 === 1"
                  [routerLink]="['/store', storeSlug(), 'products', product.slug]"
                  [style.background-image]="product.primaryImageUrl ? 'url(' + product.primaryImageUrl + ')' : null"
                >
                  <span class="na-masonry__tag">New</span>
                  <span class="na-masonry__info">
                    <span class="na-masonry__name">{{ product.name }}</span>
                    <span class="na-masonry__price">{{ product.price | currency }}</span>
                  </span>
                </a>
              }
            </div>
          } @else {
            <p class="mox-sale-section__subtitle text-center py-8">No products yet — check back soon.</p>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .na-masonry {
      column-count: 2;
      column-gap: 1.25rem;
    }
    @media (min-width: 768px) { .na-masonry { column-count: 3; } }
    @media (min-width: 1100px) { .na-masonry { column-count: 4; } }

    .na-masonry__tile {
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
    .na-masonry__tile--tall { height: 20rem; }
    .na-masonry__tile::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 55%);
    }
    .na-masonry__tag {
      position: absolute; top: 0.7rem; left: 0.7rem; z-index: 1;
      font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
      color: #fff; background: var(--mox-accent, #ff6f00); padding: 0.2rem 0.5rem; border-radius: 999px;
    }
    .na-masonry__info {
      position: relative; z-index: 1;
      display: flex; flex-direction: column; gap: 0.2rem;
      padding: 0.9rem; width: 100%;
      color: #fff;
    }
    .na-masonry__name { font-size: 0.9rem; font-weight: 700; }
    .na-masonry__price { font-size: 0.85rem; font-weight: 600; opacity: 0.9; }
  `
})
export class NewArrivalsMasonryComponent extends NewArrivalsBase {}
