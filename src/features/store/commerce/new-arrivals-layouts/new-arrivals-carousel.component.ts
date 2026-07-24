import { Component } from '@angular/core';
import { ProductCardComponent } from '../product-card.component';
import { NewArrivalsBase } from './new-arrivals-base';

/** Horizontal Scroll Carousel — a swipeable row, badged "Just In" per card. */
@Component({
  selector: 'app-new-arrivals-carousel',
  standalone: true,
  imports: [ProductCardComponent],
  template: `
    @if (enabled() && section.enabled) {
      <section class="mox-section" id="new-arrivals">
        <div class="container mx-auto px-6">
          <header class="mb-8 text-center">
            <p class="na-carousel__eyebrow">Just in</p>
            <h2 class="mox-sale-section__title">{{ heading }}</h2>
          </header>

          @if (products().length) {
            <div class="na-carousel" role="list">
              @for (product of products(); track product.id) {
                <div class="na-carousel__cell" role="listitem">
                  <app-product-card [product]="product" [storeSlug]="storeSlug()" />
                </div>
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
    .na-carousel__eyebrow {
      font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
      color: var(--mox-accent, #ff6f00); margin: 0 0 0.4rem;
    }
    .na-carousel {
      display: flex;
      gap: 1.25rem;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: 1rem;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }
    .na-carousel__cell {
      flex: 0 0 auto;
      width: 16rem;
      scroll-snap-align: start;
    }
    @media (max-width: 640px) {
      .na-carousel__cell { width: 72vw; }
    }
  `
})
export class NewArrivalsCarouselComponent extends NewArrivalsBase {}
