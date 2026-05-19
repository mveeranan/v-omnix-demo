import { Component, input } from '@angular/core';
import { Portfolio } from '../../models/portfolio.model';
import { SocialLinksComponent } from '../../shared/ui/social-links.component';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

@Component({
  selector: 'app-pf-footer-section',
  standalone: true,
  imports: [SocialLinksComponent, ScrollRevealDirective],
  templateUrl: './footer-section.component.html'
})
export class FooterSectionComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly currentYear = new Date().getFullYear();
}
