import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NewArrivalsBase } from './new-arrivals-base';

/** Compact List — image / name / brand / price rows with a "New" tag. */
@Component({
  selector: 'app-new-arrivals-compact-list',
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
            <ul class="na-list">
              @for (product of products(); track product.id) {
                <li>
                  <a class="na-list__row" [routerLink]="['/store', storeSlug(), 'products', product.slug]">
                    <span class="na-list__media"
                      [style.background-image]="product.primaryImageUrl ? 'url(' + product.primaryImageUrl + ')' : null"></span>
                    <span class="na-list__info">
                      <span class="na-list__name">{{ product.name }}</span>
                      @if (product.brandName) {
                        <span class="na-list__brand">{{ product.brandName }}</span>
                      }
                    </span>
                    <span class="na-list__tag">New</span>
                    <span class="na-list__price">{{ product.price | currency }}</span>
                  </a>
                </li>
              }
            </ul>
          } @else {
            <p class="mox-sale-section__subtitle text-center py-8">No products yet — check back soon.</p>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .na-list {
      list-style: none;
      margin: 0 auto;
      padding: 0;
      max-width: 52rem;
      border-top: 1px solid var(--mox-border, #eaeaea);
    }
    .na-list__row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0.75rem;
      border-bottom: 1px solid var(--mox-border, #eaeaea);
      text-decoration: none;
      transition: background 0.2s ease;
    }
    .na-list__row:hover { background: var(--mox-surface, #f7f7f7); }
    .na-list__media {
      flex: 0 0 auto;
      width: 4rem;
      height: 4rem;
      border-radius: var(--mox-radius, 6px);
      background-color: var(--mox-surface, #f0f0f0);
      background-size: cover;
      background-position: center;
    }
    .na-list__info { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
    .na-list__name { font-size: 0.95rem; font-weight: 700; color: var(--mox-text, #23232d); }
    .na-list__brand { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--mox-muted, #8a8a8a); }
    .na-list__tag {
      font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
      color: #fff; background: var(--mox-accent, #ff6f00); padding: 0.2rem 0.5rem; border-radius: 999px;
    }
    .na-list__price { font-size: 0.95rem; font-weight: 700; color: var(--mox-text, #23232d); }
  `
})
export class NewArrivalsCompactListComponent extends NewArrivalsBase {}
