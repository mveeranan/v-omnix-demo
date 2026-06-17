import { Component, input } from '@angular/core';
import { Portfolio } from '../../models/portfolio.model';

@Component({
  selector: 'app-pf-about-section',
  standalone: true,
  imports: [],
  templateUrl: './about-section.component.html'
})
export class AboutSectionComponent {
  readonly portfolio = input.required<Portfolio>();
  /** summary = home teaser; full = about page */
  readonly mode = input<'summary' | 'full'>('full');
}
