import { Component, input } from '@angular/core';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { Portfolio } from '../../models/portfolio.model';

@Component({
  selector: 'app-pf-about-section',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './about-section.component.html'
})
export class AboutSectionComponent {
  readonly portfolio = input.required<Portfolio>();
}
