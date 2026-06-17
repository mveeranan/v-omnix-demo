import { Injectable, signal } from '@angular/core';
import { PortfolioThemeMode } from '../../portfolio/models/portfolio.model';

@Injectable({ providedIn: 'root' })
export class StoreThemeService {
  private activeSlug = '';
  readonly visitorMode = signal<PortfolioThemeMode>('light');

  init(slug: string, defaultMode: PortfolioThemeMode): void {
    this.activeSlug = slug;
    try {
      const stored = localStorage.getItem(this.storageKey(slug));
      this.visitorMode.set(stored === 'light' || stored === 'dark' ? stored : defaultMode);
    } catch {
      this.visitorMode.set(defaultMode);
    }
  }

  effectiveMode(fallback: PortfolioThemeMode): PortfolioThemeMode {
    return this.visitorMode() ?? fallback;
  }

  toggle(): void {
    const next: PortfolioThemeMode = this.visitorMode() === 'dark' ? 'light' : 'dark';
    this.visitorMode.set(next);
    if (this.activeSlug) {
      try {
        localStorage.setItem(this.storageKey(this.activeSlug), next);
      } catch {
        /* ignore storage errors */
      }
    }
  }

  isDark(fallback: PortfolioThemeMode): boolean {
    return this.effectiveMode(fallback) === 'dark';
  }

  private storageKey(slug: string): string {
    return `work-orbit.store-theme.${slug}`;
  }
}
