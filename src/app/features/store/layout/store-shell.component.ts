import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { StoreContextService } from '../data-access/store-context.service';
import { StoreNavComponent } from './store-nav.component';
import { FooterSectionComponent } from '../../portfolio/public/sections/footer-section.component';
import { buildPortfolioThemeVars } from '../../portfolio/shared/utils/portfolio-theme.util';
import { ScrollRevealService } from '../../portfolio/shared/services/scroll-reveal.service';
import { Portfolio } from '../../portfolio/models/portfolio.model';

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
          class="pf-root store-shell mk-theme"
          [class.pf-dark]="p.theme.mode === 'dark'"
          [class.pf-light]="p.theme.mode === 'light'"
          [class.pf-root--preview]="ctx.previewMode()"
          [ngStyle]="themeStyles(p)"
        >
          <app-store-nav
            [portfolio]="p"
            [storeSlug]="ctx.slug()"
            [previewMode]="ctx.previewMode()"
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
  readonly ctx = inject(StoreContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly scrollReveal = inject(ScrollRevealService);

  constructor() {
    afterNextRender(() => this.scheduleRevealRefresh());
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

  themeStyles(p: Portfolio): Record<string, string> {
    return buildPortfolioThemeVars(p.theme);
  }

  private scheduleRevealRefresh(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.scrollReveal.refresh());
    });
  }
}
