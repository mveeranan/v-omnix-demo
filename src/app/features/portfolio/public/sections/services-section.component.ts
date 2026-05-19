import { Component, input } from '@angular/core';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { Portfolio } from '../../models/portfolio.model';
import { resolvePortfolioCtaUrl, resolvePortfolioCtaExternal } from '../../shared/utils/portfolio-cta.util';

@Component({
  selector: 'app-pf-services-section',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './services-section.component.html'
})
export class ServicesSectionComponent {
  readonly portfolio = input.required<Portfolio>();

  enabledServices() {
    return this.portfolio().services.filter((s) => s.enabled);
  }

  ctaUrl = resolvePortfolioCtaUrl;
  ctaExternal = resolvePortfolioCtaExternal;
}
