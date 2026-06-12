import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Portfolio } from '../../models/portfolio.model';
import { SocialLinksComponent } from '../../shared/ui/social-links.component';

@Component({
  selector: 'app-pf-footer-section',
  standalone: true,
  imports: [RouterLink, SocialLinksComponent],
  templateUrl: './footer-section.component.html'
})
export class FooterSectionComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly currentYear = new Date().getFullYear();

  storeLink(segment?: string): string[] {
    const base = ['/store', this.portfolio().slug];
    return segment ? [...base, segment] : base;
  }
}
