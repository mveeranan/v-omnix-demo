import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, input, OnInit, PLATFORM_ID, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { StoreContextService } from '../data-access/store-context.service';
import { StoreNavComponent } from './store-nav.component';
import { StoreHomePageComponent } from '../pages/store-home-page.component';
import { FooterSectionComponent } from '../../portfolio/public/sections/footer-section.component';
import { buildPortfolioThemeVars } from '../../portfolio/shared/utils/portfolio-theme.util';
import { ScrollRevealService } from '../../portfolio/shared/services/scroll-reveal.service';

@Component({
  selector: 'app-store-preview',
  standalone: true,
  providers: [StoreContextService],
  imports: [CommonModule, StoreNavComponent, StoreHomePageComponent, FooterSectionComponent],
  template: `
    @if (portfolio(); as p) {
      <div
        class="pf-root pf-root--preview store-shell mk-theme"
        [class.pf-dark]="p.theme.mode === 'dark'"
        [class.pf-light]="p.theme.mode === 'light'"
        [ngStyle]="themeStyles(p)"
      >
        <app-store-nav [portfolio]="p" [storeSlug]="p.slug || 'preview'" [previewMode]="true" />
        <main class="store-shell__main">
          <app-store-home-page />
        </main>
        <app-pf-footer-section [portfolio]="p" />
      </div>
    }
  `,
  styles: `.store-shell__main { min-height: 40vh; }`
})
export class StorePreviewComponent implements OnInit {
  readonly portfolio = input.required<Portfolio>();

  private readonly ctx = inject(StoreContextService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly scrollReveal = inject(ScrollRevealService);

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        requestAnimationFrame(() => this.scrollReveal.refresh());
      }
    });
  }

  ngOnInit(): void {
    const p = this.portfolio();
    this.ctx.load(p.slug || 'preview', p);
  }

  themeStyles(p: Portfolio): Record<string, string> {
    return buildPortfolioThemeVars(p.theme);
  }
}
