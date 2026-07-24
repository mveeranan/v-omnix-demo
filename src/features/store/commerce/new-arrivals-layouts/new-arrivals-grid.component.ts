import { Component } from '@angular/core';
import { ProductCardComponent } from '../product-card.component';
import { ScrollRevealDirective } from '@features/portfolio/shared/directives/scroll-reveal.directive';
import { NewArrivalsBase } from './new-arrivals-base';

/** Standard Grid — the default centered-heading product grid. */
@Component({
  selector: 'app-new-arrivals-grid',
  standalone: true,
  imports: [ProductCardComponent, ScrollRevealDirective],
  template: `
    @if (enabled() && section.enabled) {
      <section class="mox-section" id="new-arrivals">
        <div class="container mx-auto px-6">
          <header class="mb-8 text-center" appScrollReveal>
            <h2 class="mox-sale-section__title">{{ heading }}</h2>
          </header>

          @if (loading()) {
            <div class="mox-product-grid">
              @for (i of [1, 2, 3, 4]; track i) {
                <div class="mox-product-card mox-skeleton h-80 animate-pulse"></div>
              }
            </div>
          } @else if (products().length) {
            <div class="mox-product-grid">
              @for (product of products(); track product.id; let i = $index) {
                <app-product-card
                  [product]="product"
                  [storeSlug]="storeSlug()"
                  appScrollReveal
                  [appScrollRevealDelay]="i * 50"
                />
              }
            </div>
          } @else {
            <p class="mox-sale-section__subtitle text-center py-8">No products yet — check back soon.</p>
          }
        </div>
      </section>
    }
  `
})
export class NewArrivalsGridComponent extends NewArrivalsBase {}
