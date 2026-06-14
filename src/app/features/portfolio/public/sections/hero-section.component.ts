import { Component, computed, input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ShoppingBag } from 'lucide-angular';
import { Portfolio, PortfolioHeroSlide } from '../../models/portfolio.model';

@Component({
  selector: 'app-pf-hero-section',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
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
  ]
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  readonly portfolio = input.required<Portfolio>();
  readonly viewWork = output<void>();
  readonly shopIcon = ShoppingBag;

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
        headline: p.hero.headline?.trim() || p.brand.businessName || 'Welcome',
        subheadline: p.hero.subheadline?.trim() || p.brand.tagline,
        ctaLabel: p.cta.label || 'Shop now',
        ctaTarget: ''
      }
    ];
  });

  readonly activeSlide = computed(() => {
    const p = this.portfolio();
    const slide = this.slides()[this.activeIndex()] ?? this.slides()[0];
    return {
      ...slide,
      headline: slide.headline?.trim() || p.hero.headline?.trim() || p.brand.businessName || 'Welcome',
      subheadline: slide.subheadline?.trim() || p.hero.subheadline?.trim() || p.brand.tagline,
      ctaLabel: slide.ctaLabel?.trim() || p.cta.label || 'Shop now'
    };
  });

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

  primaryCtaLink(): string[] {
    const slide = this.activeSlide();
    if (slide.ctaTarget?.startsWith('/')) {
      return slide.ctaTarget.split('/').filter(Boolean);
    }
    const slug = this.portfolio().slug;
    return slug ? ['/store', slug, 'products'] : ['/store'];
  }

  contactLink(): string[] {
    const slug = this.portfolio().slug;
    return slug ? ['/store', slug, 'contact'] : ['/store'];
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
