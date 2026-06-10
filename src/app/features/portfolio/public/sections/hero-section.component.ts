import { Component, input, output } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Portfolio, PortfolioCta } from '../../models/portfolio.model';
import { PortfolioSocial } from '../../models/portfolio.model';
import { resolvePortfolioCtaUrl, resolvePortfolioCtaExternal } from '../../shared/utils/portfolio-cta.util';

@Component({
  selector: 'app-pf-hero-section',
  standalone: true,
  templateUrl: './hero-section.component.html',
  animations: [
    trigger('heroEnter', [
      transition(':enter', [
        query('.hero-item', [
          style({ opacity: 0, transform: 'translateY(24px)' }),
          stagger(120, [animate('600ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))])
        ])
      ])
    ])
  ]
})
export class HeroSectionComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly viewWork = output<void>();

  ctaUrl(cta: PortfolioCta, social: PortfolioSocial): string {
    return resolvePortfolioCtaUrl(cta, social, this.portfolio().slug);
  }

  ctaExternal(cta: PortfolioCta): boolean {
    return resolvePortfolioCtaExternal(cta);
  }
}

