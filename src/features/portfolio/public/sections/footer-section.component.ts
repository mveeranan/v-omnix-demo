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
      background: color-mix(in srgb, var(--mox-border, #eaeaea) 24%, var(--mox-surface, #fff));
      border-top: 1px solid var(--mox-border, #eaeaea);
    }
    .msp-footer__grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      padding: 3rem 0 2.5rem;
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
      color: var(--mox-text, #23232d);
    }
    .msp-footer__tagline {
      margin: 0;
      max-width: 22rem;
      font-size: 0.88rem;
      line-height: 1.6;
      color: var(--mox-muted, #8a8a8a);
    }
    .msp-footer__social { margin-top: 1.1rem; }

    .msp-footer__col { display: flex; flex-direction: column; }
    .msp-footer__title {
      margin: 0 0 0.9rem;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--mox-text, #23232d);
    }
    .msp-footer__link {
      padding: 0.28rem 0;
      font-size: 0.88rem;
      color: var(--mox-muted, #8a8a8a);
      text-decoration: none;
      transition: color 0.2s ease;
      width: fit-content;
    }
    .msp-footer__link:hover { color: var(--mox-accent, #fe4c50); }

    .msp-footer__bar {
      border-top: 1px solid var(--mox-border, #eaeaea);
      background: var(--mox-surface, #fff);
    }
    .msp-footer__copy {
      margin: 0;
      padding: 1rem 0;
      font-size: 0.8rem;
      text-align: center;
      color: var(--mox-muted, #8a8a8a);
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
