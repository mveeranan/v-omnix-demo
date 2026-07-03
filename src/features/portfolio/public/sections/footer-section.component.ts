import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Portfolio } from '../../models/portfolio.model';
import { SocialLinksComponent } from '@features/portfolio/shared/ui/social-links.component';

/** Minishop-style footer: link columns on a light band + slim copyright bar. */
@Component({
  selector: 'app-pf-footer-section',
  standalone: true,
  imports: [RouterLink, SocialLinksComponent],
  templateUrl: './footer-section.component.html',
  styles: `
    .msp-footer {
      margin-top: 3rem;
      background: var(--mox-primary, #000);
      border-top: none;
    }
    .msp-footer__grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      padding: 7em 0 3rem;
    }
    @media (min-width: 640px) {
      .msp-footer__grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 1024px) {
      .msp-footer__grid { grid-template-columns: 2fr 1fr 1fr 1.4fr; }
    }

    .msp-footer__brand {
      margin: 0 0 0.4rem;
      font-family: var(--mox-font-heading, inherit);
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
    }
    .msp-footer__tagline {
      margin: 0;
      max-width: 22rem;
      font-size: 0.88rem;
      line-height: 1.8;
      color: rgba(255, 255, 255, 0.55);
    }
    .msp-footer__social {
      margin-top: 1.3rem;
      display: flex;
      gap: 0.6rem;
    }
    .msp-footer__social ::ng-deep a {
      display: grid;
      place-items: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 999px;
      background: var(--mox-accent, #dbcc8f);
      color: #000;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }
    .msp-footer__social ::ng-deep a:hover { transform: translateY(-3px); opacity: 0.85; }

    .msp-footer__col { display: flex; flex-direction: column; }
    .msp-footer__title {
      margin: 0 0 1.2rem;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #fff;
    }
    .msp-footer__link {
      padding: 0.32rem 0;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.55);
      text-decoration: none;
      transition: color 0.2s ease;
      width: fit-content;
    }
    .msp-footer__link:hover { color: var(--mox-accent, #dbcc8f); }

    .msp-footer__bar {
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      background: var(--mox-primary, #000);
    }
    .msp-footer__copy {
      margin: 0;
      padding: 1.5rem 0;
      font-size: 0.8rem;
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
    }
  `
})
export class FooterSectionComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly currentYear = new Date().getFullYear();

  storeLink(segment?: string): string[] {
    const base = ['/store', this.portfolio().slug];
    return segment ? [...base, segment] : base;
  }
}
