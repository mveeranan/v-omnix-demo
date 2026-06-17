import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Portfolio } from '../../portfolio/models/portfolio.model';

@Component({
  selector: 'app-promo-strip-section',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (enabled() && portfolio().promoStrip.enabled && portfolio().promoStrip.text) {
      <section class="mox-promo-strip">
        <div class="container mx-auto px-6">
          <div class="mox-promo-strip__inner">
            <p class="font-medium">{{ portfolio().promoStrip.text }}</p>
            @if (portfolio().promoStrip.buttonLabel) {
              <a [routerLink]="ctaLink()" class="mox-chip">{{ portfolio().promoStrip.buttonLabel }}</a>
            }
          </div>
        </div>
      </section>
    }
  `
})
export class PromoStripSectionComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly storeSlug = input.required<string>();
  readonly enabled = input(true);

  ctaLink(): string[] {
    const target = this.portfolio().promoStrip.buttonTarget?.trim();
    if (target?.startsWith('/')) {
      return target.split('/').filter(Boolean);
    }
    return ['/store', this.storeSlug(), 'products'];
  }
}
