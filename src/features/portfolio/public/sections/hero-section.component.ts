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
      overflow: hidden;
      background: var(--mox-hero-bg, color-mix(in srgb, var(--mox-accent, #dbb96a) 35%, #f3ead1));
    }
    :host-context(.dark) .msp-hero {
      background: var(--mox-hero-bg, color-mix(in srgb, var(--mox-accent, #7c8aff) 25%, #1e293b));
    }
    .msp-hero__grid {
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-columns: 1fr;
      align-items: center;
      gap: 2.5rem;
      min-height: clamp(24rem, 62vh, 36rem);
      padding: 3.5rem 0;
    }
    @media (min-width: 900px) {
      .msp-hero__grid {
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }
    }

    .msp-hero__content {
      max-width: 32rem;
      text-align: left;
    }
    .msp-hero__badge {
      display: inline-block;
      margin: 0 0 1.25rem;
      padding: 0.4rem 0.9rem;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: #fff;
      background: var(--mox-text, #1a1a1a);
    }
    .msp-hero__title {
      margin: 0;
      font-family: var(--mox-font-heading, inherit);
      font-size: clamp(2rem, 4.6vw, 3.15rem);
      font-weight: 500;
      line-height: 1.15;
      text-transform: uppercase;
      color: var(--mox-text, #1a1a1a);
    }
    .msp-hero__subtitle {
      margin: 1.15rem 0 0;
      max-width: 26rem;
      font-size: 1rem;
      line-height: 1.7;
      color: var(--mox-muted, #6b6b6b);
    }
    .msp-hero__cta {
      display: inline-flex;
      align-items: center;
      margin-top: 2.1rem;
      padding: 0.85rem 2.1rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #fff;
      background: var(--mox-accent, #c9a24a);
      border-radius: var(--mox-btn-radius, 2px);
      text-decoration: none;
      transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    }
    .msp-hero__cta:hover {
      background: color-mix(in srgb, var(--mox-accent, #c9a24a) 85%, #000);
      transform: translateY(-2px);
      box-shadow: 0 10px 24px -8px rgba(0, 0, 0, 0.3);
    }

    .msp-hero__media {
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      min-height: 16rem;
      height: 100%;
    }
    .msp-hero__image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center bottom;
      opacity: 0;
      transform: scale(0.92) translateY(12px);
      transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
      pointer-events: none;
    }
    .msp-hero__image--active {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    @media (min-width: 900px) {
      .msp-hero__media { min-height: 100%; }
      .msp-hero__image { transform: scale(1.12); }
      .msp-hero__image--active { transform: scale(1.18); }
    }

    .msp-hero__dots {
      position: absolute;
      bottom: 1.25rem;
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
      background: color-mix(in srgb, var(--mox-text, #1a1a1a) 25%, transparent);
      border: none;
      border-radius: 999px;
      cursor: pointer;
      transition: background 0.2s ease, width 0.2s ease;
    }
    .msp-hero__dot--active {
      width: 1.6rem;
      background: var(--mox-text, #1a1a1a);
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
