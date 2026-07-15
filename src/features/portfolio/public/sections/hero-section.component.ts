import { Component, computed, input, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Portfolio, PortfolioHeroSlide } from '../../models/portfolio.model';

/**
 * Rotating hero, matching the Minishop reference exactly: a solid-color band
 * with left-aligned text content (eyebrow, headline, subheadline, CTA)
 * absolutely positioned over the left ~35%, and a right-floating product
 * cutout image at 65% width — not a full-bleed cover photo. Dot navigation
 * bottom-center. Colors come from the store theme CSS variables.
 */
@Component({
  selector: 'app-pf-hero-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero-section.component.html',
  animations: [
    trigger('heroEnter', [
      transition(':enter', [
        query('.hero-item', [
          style({ opacity: 0, transform: 'translateY(24px)' }),
          stagger(120, [
            animate('600ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ])
    ])
  ],
  styles: `
    /* Exact match to the Minishop reference's actual hero markup (verified
       against the live DOM, not just the stylesheet): a SOLID-color 750px
       band with left-aligned text and a right-floating product cutout image
       at 65% width — NOT a full-bleed cover photo with a dark overlay. An
       earlier pass here built the cover-photo version from a misread of the
       .slider-item CSS rule before checking the rendered markup; corrected. */
    .msp-hero {
      position: relative;
      overflow: hidden;
      height: clamp(28rem, 82vh, 46.875rem);
      background: var(--mox-hero-bg, var(--mox-accent, #dbcc8f));
    }

    .msp-hero__grid {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      height: 100%;
    }

    .msp-hero__content {
      position: absolute;
      left: 0;
      max-width: 26rem;
      padding-left: 1.5rem;
      text-align: left;
    }
    @media (min-width: 640px) {
      .msp-hero__content { padding-left: 3rem; }
    }
    .msp-hero__badge {
      display: block;
      margin: 0 0 0.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 4px;
      color: #fff;
    }
    .msp-hero__title {
      margin: 0.75rem 0;
      font-family: var(--mox-font-heading, inherit);
      /* Exact reference: 44px / weight 300 (thin) — deliberately not bold. */
      font-size: 2.75rem;
      font-weight: 300;
      line-height: 1.3;
      text-transform: uppercase;
      color: #000;
    }
    .msp-hero__subtitle {
      margin: 0 0 1rem;
      max-width: 26rem;
      font-size: 1rem;
      line-height: 1.6;
      color: rgba(0, 0, 0, 0.8);
    }
    .msp-hero__cta {
      display: inline-flex;
      align-items: center;
      /* Exact reference .btn-custom: plain rectangle, larger text, no tracking —
         deliberately different from the pill CTAs used elsewhere on the site. */
      padding: 0.625rem 1.25rem;
      font-size: 1.4375rem;
      font-weight: 400;
      color: #fff;
      background: var(--mox-accent, #c2a942);
      border-radius: 0;
      text-decoration: none;
      transition: background 0.2s ease;
    }
    .msp-hero__cta:hover {
      background: color-mix(in srgb, var(--mox-accent, #c2a942) 85%, #000);
    }

    .msp-hero__media {
      position: relative;
      z-index: -1;
      width: 65%;
      height: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .msp-hero__image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center bottom;
      opacity: 0;
      transform: translateX(6%) scale(0.96);
      transition: opacity 0.7s ease, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
      pointer-events: none;
    }
    .msp-hero__image--active {
      opacity: 1;
      transform: translateX(0) scale(1);
    }

    .msp-hero__dots {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 1.75rem;
      z-index: 2;
      display: flex;
      justify-content: center;
      gap: 0.5rem;
    }
    .msp-hero__dot {
      width: 0.6rem;
      height: 0.6rem;
      padding: 0;
      background: rgba(0, 0, 0, 0.25);
      border: none;
      border-radius: 999px;
      cursor: pointer;
      transition: background 0.2s ease, width 0.2s ease;
    }
    .msp-hero__dot--active {
      width: 1.6rem;
      background: #000;
    }
  `
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  readonly portfolio = input.required<Portfolio>();

  readonly activeIndex = signal(0);
  private rotateTimer?: ReturnType<typeof setInterval>;

  readonly eyebrow = computed(() => {
    const p = this.portfolio();
    return p.hero.eyebrow?.trim() || 'special offer';
  });

  /** Hero banner uses slide images only — never brand cover or story image. */
  readonly slides = computed((): PortfolioHeroSlide[] => {
    const p = this.portfolio();
    const configured = p.hero.slides ?? [];
    if (configured.length) return configured;

    return [
      {
        id: 'fallback',
        imageUrl: '',
        headline: p.brand.businessName || 'Welcome',
        subheadline: p.brand.tagline,
        ctaLabel: '',
        ctaTarget: ''
      }
    ];
  });

  readonly activeSlide = computed(() => {
    const slide = this.slides()[this.activeIndex()] ?? this.slides()[0];
    return {
      ...slide,
      headline: slide.headline?.trim() || 'Welcome',
      subheadline: slide.subheadline?.trim() || ''
    };
  });

  shopLink(): string[] {
    return ['/store', this.portfolio().slug, 'products'];
  }

  ngOnInit(): void {
    this.startRotation();
  }

  ngOnDestroy(): void {
    this.stopRotation();
  }

  goTo(index: number): void {
    this.activeIndex.set(index);
    this.stopRotation();
    this.startRotation();
  }

  private startRotation(): void {
    this.stopRotation();
    if (this.slides().length > 1) {
      this.rotateTimer = setInterval(() => {
        this.activeIndex.update((i) => (i + 1) % this.slides().length);
      }, 6000);
    }
  }

  private stopRotation(): void {
    if (this.rotateTimer) {
      clearInterval(this.rotateTimer);
      this.rotateTimer = undefined;
    }
  }
}
