import { Component, computed, input, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Portfolio, PortfolioHeroSlide } from '../../models/portfolio.model';

/**
 * Full-bleed rotating hero: image with Ken Burns zoom, left-aligned content
 * block (eyebrow, headline, subheadline, CTA), dot navigation bottom-center.
 * Colors come from the store theme CSS variables.
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
    .msp-hero {
      position: relative;
      min-height: clamp(26rem, 68vh, 42rem);
      overflow: hidden;
      background: color-mix(in srgb, var(--mox-border, #eaeaea) 30%, var(--mox-surface, #fff));
    }
    .msp-hero__slide {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      opacity: 0;
      transform: scale(1);
      transition: opacity 1.2s ease;
    }
    .msp-hero__slide--active {
      opacity: 1;
      animation: msp-hero-kenburns 8s ease-out forwards;
    }
    @keyframes msp-hero-kenburns {
      from { transform: scale(1.08); }
      to { transform: scale(1); }
    }
    @media (prefers-reduced-motion: reduce) {
      .msp-hero__slide--active { animation: none; }
    }
    .msp-hero__slide--gradient {
      background: linear-gradient(
        120deg,
        color-mix(in srgb, var(--mox-accent, #fe4c50) 14%, var(--mox-surface, #fff)),
        var(--mox-surface, #fff) 60%
      );
    }
    .msp-hero__scrim {
      position: absolute;
      inset: 0;
      background: linear-gradient(100deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.28) 45%, rgba(0, 0, 0, 0.05) 75%);
      pointer-events: none;
    }
    /* On gradient (no-image) slides the scrim would gray the design out */
    .msp-hero:has(.msp-hero__slide--gradient.msp-hero__slide--active) .msp-hero__scrim {
      background: none;
    }
    .msp-hero:has(.msp-hero__slide--gradient.msp-hero__slide--active) .msp-hero__title,
    .msp-hero:has(.msp-hero__slide--gradient.msp-hero__slide--active) .msp-hero__subtitle {
      color: var(--mox-text, #23232d);
      text-shadow: none;
    }

    .msp-hero__overlay {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      min-height: inherit;
      padding: 4.5rem 0;
    }
    .msp-hero__content {
      max-width: 36rem;
      text-align: left;
    }
    .msp-hero__eyebrow {
      margin: 0 0 0.9rem;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.22em;
      color: var(--mox-accent, #fe4c50);
    }
    .msp-hero__title {
      margin: 0;
      font-family: var(--mox-font-heading, inherit);
      font-size: clamp(2.1rem, 5.2vw, 3.5rem);
      font-weight: 700;
      line-height: 1.1;
      color: #fff;
      text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
    }
    .msp-hero__subtitle {
      margin: 1.1rem 0 0;
      max-width: 28rem;
      font-size: 1.05rem;
      line-height: 1.65;
      color: rgba(255, 255, 255, 0.94);
      text-shadow: 0 1px 10px rgba(0, 0, 0, 0.25);
    }
    .msp-hero__cta {
      display: inline-flex;
      align-items: center;
      margin-top: 2rem;
      padding: 0.9rem 2.3rem;
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #fff;
      background: var(--mox-accent, #fe4c50);
      border-radius: var(--mox-btn-radius, 2px);
      text-decoration: none;
      transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    }
    .msp-hero__cta:hover {
      background: color-mix(in srgb, var(--mox-accent, #fe4c50) 85%, #000);
      transform: translateY(-2px);
      box-shadow: 0 10px 24px -8px rgba(0, 0, 0, 0.4);
    }

    .msp-hero__dots {
      position: absolute;
      bottom: 1.5rem;
      left: 50%;
      z-index: 3;
      display: flex;
      gap: 0.5rem;
      transform: translateX(-50%);
    }
    .msp-hero__dot {
      width: 0.6rem;
      height: 0.6rem;
      padding: 0;
      background: rgba(255, 255, 255, 0.55);
      border: none;
      border-radius: 999px;
      cursor: pointer;
      transition: background 0.2s ease, width 0.2s ease;
    }
    .msp-hero__dot--active {
      width: 1.6rem;
      background: var(--mox-accent, #fe4c50);
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

  slideBackground(slide: PortfolioHeroSlide): string | null {
    return slide.imageUrl?.trim() ? `url(${slide.imageUrl})` : null;
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
