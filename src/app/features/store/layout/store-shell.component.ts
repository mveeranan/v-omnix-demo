import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component,
  effect,
  inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { StoreContextService } from '../data-access/store-context.service';
import { StoreThemeService } from '../data-access/store-theme.service';
import { StoreNavComponent } from './store-nav.component';
import { FooterSectionComponent } from '../../portfolio/public/sections/footer-section.component';
import { buildPortfolioThemeVars, moxSchemeClass } from '../../portfolio/shared/utils/portfolio-theme.util';
import { ScrollRevealService } from '../../portfolio/shared/services/scroll-reveal.service';
import { Portfolio, PortfolioThemeMode } from '../../portfolio/models/portfolio.model';

@Component({
  selector: 'app-store-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, StoreNavComponent, FooterSectionComponent],
  providers: [StoreContextService],
  template: `
    @if (ctx.previewMode()) {
      <div class="pf-preview-banner">Preview — changes are not yet live until you publish</div>
    }

    @if (ctx.loading()) {
      <div class="pf-loading">
        <div class="pf-loading-shimmer"></div>
        <p class="pf-text-muted mt-4 text-sm">Loading store…</p>
      </div>
    } @else if (ctx.notFound()) {
      <div class="pf-not-found">
        <h1 class="pf-display pf-heading text-3xl font-semibold">Store not found</h1>
        <p class="pf-text-muted mt-2">This store may be unpublished or the link is incorrect.</p>
      </div>
    } @else {
      @if (ctx.portfolio(); as p) {
        <div
          [class]="shellClass(p)"
          [class.pf-root--preview]="ctx.previewMode()"
          [ngStyle]="themeStyles(p)"
        >
          <app-store-nav
            [portfolio]="p"
            [storeSlug]="ctx.slug()"
            [previewMode]="ctx.previewMode()"
            [themeMode]="resolvedMode(p)"
          />
          <main class="store-shell__main">
            <router-outlet />
          </main>
          <app-pf-footer-section [portfolio]="p" />
        </div>
      }
    }
  `,
  styles: `
    .store-shell__main { min-height: 50vh; }
  `
})
export class StoreShellComponent implements OnInit, OnDestroy {
  readonly moxSchemeClass = moxSchemeClass;
  readonly ctx = inject(StoreContextService);
  readonly storeTheme = inject(StoreThemeService);
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly scrollReveal = inject(ScrollRevealService);

  constructor() {
    afterNextRender(() => this.scheduleRevealRefresh());

    effect(() => {
      const p = this.ctx.portfolio();
      const slug = this.ctx.slug();
      if (!p || !slug) return;
      if (this.ctx.previewMode()) {
        this.storeTheme.visitorMode.set(p.theme.mode);
      } else {
        this.storeTheme.init(slug, p.theme.mode);
      }
    });
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.ctx.notFound.set(true);
      this.ctx.loading.set(false);
      return;
    }
    this.ctx.load(slug);
  }

  ngOnDestroy(): void {
    /* context scoped to shell */
  }

  resolvedMode(p: Portfolio): PortfolioThemeMode {
    this.storeTheme.visitorMode();
    return this.ctx.previewMode() ? p.theme.mode : this.storeTheme.effectiveMode(p.theme.mode);
  }

  shellClass(p: Portfolio): string {
    const mode = this.resolvedMode(p);
    return `pf-root store-shell mox-theme ${moxSchemeClass(p.theme.colorScheme)} ${mode === 'dark' ? 'pf-dark' : 'pf-light'}`;
  }

  themeStyles(p: Portfolio): Record<string, string> {
    return buildPortfolioThemeVars({ ...p.theme, mode: this.resolvedMode(p) });
  }

  private scheduleRevealRefresh(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.scrollReveal.refresh());
    });
  }
}
