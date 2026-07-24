import { Component, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NewArrivalsBase } from './new-arrivals-base';

/** Slider with Side Navigation — one large product view, thumbnail rail to switch. */
@Component({
  selector: 'app-new-arrivals-side-nav-slider',
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
            <div class="na-slider">
              <a class="na-slider__main"
                [routerLink]="['/store', storeSlug(), 'products', active().slug]"
                [style.background-image]="active().primaryImageUrl ? 'url(' + active().primaryImageUrl + ')' : null"
              >
                <span class="na-slider__main-info">
                  <span class="na-slider__name">{{ active().name }}</span>
                  <span class="na-slider__price">{{ active().price | currency }}</span>
                </span>
              </a>
              <div class="na-slider__rail" role="list">
                @for (product of products(); track product.id; let i = $index) {
                  <button type="button" class="na-slider__thumb" role="listitem"
                    [class.is-active]="activeIndex() === i"
                    [style.background-image]="product.primaryImageUrl ? 'url(' + product.primaryImageUrl + ')' : null"
                    (click)="select(i)"
                    [attr.aria-label]="product.name"
                  ></button>
                }
              </div>
            </div>
          } @else {
            <p class="mox-sale-section__subtitle text-center py-8">No products yet — check back soon.</p>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .na-slider {
      display: flex;
      gap: 1.25rem;
    }
    .na-slider__main {
      position: relative;
      flex: 1;
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
    .na-slider__main::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 55%);
    }
    .na-slider__main-info {
      position: relative; z-index: 1;
      display: flex; flex-direction: column; gap: 0.3rem;
      padding: 1.5rem; color: #fff;
    }
    .na-slider__name { font-size: 1.3rem; font-weight: 700; }
    .na-slider__price { font-size: 1.05rem; font-weight: 600; }

    .na-slider__rail {
      flex: 0 0 auto;
      width: 5.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 22rem;
      overflow-y: auto;
    }
    .na-slider__thumb {
      width: 5.5rem;
      height: 5.5rem;
      padding: 0;
      border: 2px solid transparent;
      border-radius: var(--mox-radius, 6px);
      background-color: var(--mox-surface, #f0f0f0);
      background-size: cover;
      background-position: center;
      cursor: pointer;
      transition: border-color 0.2s ease;
    }
    .na-slider__thumb.is-active,
    .na-slider__thumb:hover { border-color: var(--mox-accent, #ff6f00); }
  `
})
export class NewArrivalsSideNavSliderComponent extends NewArrivalsBase {
  readonly activeIndex = signal(0);

  readonly active = computed(() => {
    const items = this.products();
    const idx = Math.min(this.activeIndex(), items.length - 1);
    return items[Math.max(idx, 0)];
  });

  select(i: number): void {
    this.activeIndex.set(i);
  }
}
