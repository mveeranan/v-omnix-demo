import { Component, input } from '@angular/core';
import { Portfolio } from '../../portfolio/models/portfolio.model';

@Component({
  selector: 'app-brand-strip-section',
  standalone: true,
  imports: [],
  template: `
    @if (portfolio().brandStrip.enabled && portfolio().brandStrip.logos.length) {
      <section class="mox-section mox-brand-strip" id="brands">
        <div class="container mx-auto px-6">
          @if (portfolio().brandStrip.title) {
            <p class="mox-brand-strip__label">{{ portfolio().brandStrip.title }}</p>
          }
          <div class="mox-brand-strip__track-wrap">
            <div class="mox-brand-strip__track">
              @for (logo of logos(); track logo.id) {
                <div class="mox-brand-strip__item">
                  @if (logo.logoUrl) {
                    <img [src]="logo.logoUrl" [alt]="logo.name" class="mox-brand-strip__logo" loading="lazy" />
                  } @else {
                    <span class="mox-brand-strip__name">{{ logo.name }}</span>
                  }
                </div>
              }
              <!-- Duplicate for infinite scroll illusion -->
              @for (logo of logos(); track 'dup-' + logo.id) {
                <div class="mox-brand-strip__item" aria-hidden="true">
                  @if (logo.logoUrl) {
                    <img [src]="logo.logoUrl" [alt]="logo.name" class="mox-brand-strip__logo" loading="lazy" />
                  } @else {
                    <span class="mox-brand-strip__name">{{ logo.name }}</span>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </section>
    }
  `
})
export class BrandStripSectionComponent {
  readonly portfolio = input.required<Portfolio>();

  logos() {
    return this.portfolio().brandStrip.logos;
  }
}
