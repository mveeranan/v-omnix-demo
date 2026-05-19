import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component,
  inject,
  input,
  OnInit,
  signal,
  effect,
  PLATFORM_ID,
  afterNextRender
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Portfolio } from '../models/portfolio.model';
import { PortfolioService } from '../data-access/portfolio.service';
import { HeroSectionComponent } from './sections/hero-section.component';
import { AboutSectionComponent } from './sections/about-section.component';
import { ServicesSectionComponent } from './sections/services-section.component';
import { GallerySectionComponent } from './sections/gallery-section.component';
import { ReviewsSectionComponent } from './sections/reviews-section.component';
import { StatsSectionComponent } from './sections/stats-section.component';
import { TeamSectionComponent } from './sections/team-section.component';
import { FooterSectionComponent } from './sections/footer-section.component';
import { PortfolioNavComponent } from './sections/portfolio-nav.component';
import { HighlightsSectionComponent } from './sections/highlights-section.component';
import { buildPortfolioThemeVars } from '../shared/utils/portfolio-theme.util';
import { ScrollRevealService } from '../shared/services/scroll-reveal.service';

@Component({
  selector: 'app-public-portfolio',
  standalone: true,
  host: {
    class: 'block',
    '[class.pf-preview-host]': 'previewMode()'
  },
  imports: [
    CommonModule,
    HeroSectionComponent,
    AboutSectionComponent,
    ServicesSectionComponent,
    GallerySectionComponent,
    ReviewsSectionComponent,
    StatsSectionComponent,
    TeamSectionComponent,
    FooterSectionComponent,
    PortfolioNavComponent,
    HighlightsSectionComponent
  ],
  templateUrl: './public-portfolio.component.html',
  styleUrl: './public-portfolio.component.scss'
})
export class PublicPortfolioComponent implements OnInit {
  private readonly route = inject(ActivatedRoute, { optional: true });
  private readonly portfolioService = inject(PortfolioService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly scrollReveal = inject(ScrollRevealService);

  /** When set, renders this portfolio directly (editor preview). */
  readonly portfolioInput = input<Portfolio | null>(null, { alias: 'portfolio' });
  readonly previewMode = input(false);

  readonly portfolio = signal<Portfolio | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);

  constructor() {
    afterNextRender(() => this.scheduleRevealRefresh());

    effect(() => {
      const direct = this.portfolioInput();
      if (direct) {
        this.portfolio.set(direct);
        this.loading.set(false);
        this.notFound.set(false);
        this.applyTheme(direct);
        this.scheduleRevealRefresh();
      }
    });

    effect(() => {
      const loaded = this.portfolio();
      if (loaded && !this.loading()) {
        this.scheduleRevealRefresh();
      }
    });
  }

  ngOnInit(): void {
    const direct = this.portfolioInput();
    if (direct) {
      this.loading.set(false);
      return;
    }

    const slug = this.route?.snapshot.paramMap.get('slug');
    if (!slug) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    this.portfolioService.getBySlug(slug).subscribe({
      next: (p) => {
        this.portfolio.set(p);
        this.loading.set(false);
        this.applyTheme(p);
        this.scheduleRevealRefresh();
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      }
    });
  }

  scrollToGallery(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
  }

  themeStyles(p: Portfolio): Record<string, string> {
    return buildPortfolioThemeVars(p.theme);
  }

  private applyTheme(p: Portfolio): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const host = this.document.querySelector('.pf-root');
    if (host instanceof HTMLElement) {
      Object.entries(this.themeStyles(p)).forEach(([k, v]) => host.style.setProperty(k, v));
    }
  }

  private scheduleRevealRefresh(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.scrollReveal.refresh());
    });
  }
}
