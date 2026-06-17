import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, afterNextRender } from '@angular/core';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { StoreContextService } from '../data-access/store-context.service';
import { StoreThemeService } from '../data-access/store-theme.service';
import { StoreNavComponent } from './store-nav.component';
import { StoreHomePageComponent } from '../pages/store-home-page.component';
import { FooterSectionComponent } from '../../portfolio/public/sections/footer-section.component';
import { buildPortfolioThemeVars, moxSchemeClass } from '../../portfolio/shared/utils/portfolio-theme.util';
import { ScrollRevealService } from '../../portfolio/shared/services/scroll-reveal.service';
import { PortfolioThemeMode } from '../../portfolio/models/portfolio.model';

@Component({
  selector: 'app-store-preview',
  standalone: true,
  providers: [StoreContextService],
  imports: [CommonModule, StoreNavComponent, StoreHomePageComponent, FooterSectionComponent],
  template: `
    @if (portfolio(); as p) {
      <div
        [class]="shellClass(p)"
        [ngStyle]="themeStyles(p)"
      >
        <app-store-nav
          [portfolio]="p"
          [storeSlug]="p.slug || 'preview'"
          [previewMode]="true"
          [themeMode]="resolvedMode(p)"
        />
        <main class="store-shell__main">
          <app-store-home-page />
        </main>
        <app-pf-footer-section [portfolio]="p" />
      </div>
    }
  `,
  styles: `.store-shell__main { min-height: 40vh; }`
})
export class StorePreviewComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly moxSchemeClass = moxSchemeClass;

  private readonly ctx = inject(StoreContextService);
  readonly storeTheme = inject(StoreThemeService);
  private readonly scrollReveal = inject(ScrollRevealService);

  constructor() {
    effect(() => {
      const p = this.portfolio();
      this.storeTheme.visitorMode.set(p.theme.mode ?? 'light');
      this.ctx.load(p.slug || 'preview', structuredClone(p));
    });

    afterNextRender(() => this.scrollReveal.refresh());
  }

  resolvedMode(p: Portfolio): PortfolioThemeMode {
    this.storeTheme.visitorMode();
    return this.storeTheme.effectiveMode(p.theme.mode ?? 'light');
  }

  shellClass(p: Portfolio): string {
    const mode = this.resolvedMode(p);
    return `pf-root pf-root--preview store-shell mox-theme ${moxSchemeClass(p.theme.colorScheme)} ${mode === 'dark' ? 'pf-dark' : 'pf-light'}`;
  }

  themeStyles(p: Portfolio): Record<string, string> {
    return buildPortfolioThemeVars({ ...p.theme, mode: this.resolvedMode(p) });
  }
}
