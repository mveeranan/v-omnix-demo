import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { Portfolio } from '../../models/portfolio.model';

@Component({
  selector: 'app-pf-team-section',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './team-section.component.html'
})
export class TeamSectionComponent {
  readonly portfolio = input.required<Portfolio>();
}
