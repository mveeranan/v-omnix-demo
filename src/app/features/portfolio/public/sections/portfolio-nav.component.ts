import { Component, input, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Portfolio } from '../../models/portfolio.model';

@Component({
  selector: 'app-pf-portfolio-nav',
  standalone: true,
  template: `
    <nav class="pf-nav" [class.pf-nav--preview]="previewMode()">
      <div class="container mx-auto flex items-center justify-between px-6 py-4">
        <button type="button" class="pf-nav-brand pf-display text-sm font-semibold" (click)="scrollTo('hero')">
          {{ portfolio().brand.businessName }}
        </button>
        <div class="hidden items-center gap-6 md:flex">
          @for (link of navLinks(); track link.id) {
            <button type="button" class="pf-nav-link text-sm" (click)="scrollTo(link.id)">{{ link.label }}</button>
          }
        </div>
      </div>
    </nav>
  `,
  styles: `
    .pf-nav {
      position: sticky;
      top: 0;
      z-index: 40;
      backdrop-filter: blur(14px);
      background: color-mix(in srgb, var(--pf-primary) 82%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--pf-accent) 22%, transparent);
    }
    .pf-nav--preview {
      top: 2rem;
    }
    .pf-nav-brand, .pf-nav-link {
      color: var(--pf-text);
      transition: color 0.2s ease;
    }
    .pf-nav-link:hover, .pf-nav-brand:hover {
      color: var(--pf-accent);
    }
  `
})
export class PortfolioNavComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly previewMode = input(false);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  navLinks(): { id: string; label: string }[] {
    const p = this.portfolio();
    const links: { id: string; label: string }[] = [{ id: 'hero', label: 'Home' }];
    if (p.about.enabled) links.push({ id: 'about', label: 'About' });
    if (p.services.some((s) => s.enabled)) links.push({ id: 'services', label: 'Services' });
    if (p.gallery.length) links.push({ id: 'gallery', label: 'Work' });
    if (p.reviews.length) links.push({ id: 'reviews', label: 'Reviews' });
    if (p.highlights.enabled && p.highlights.items.length) links.push({ id: 'highlights', label: 'Why us' });
    return links;
  }

  scrollTo(id: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = this.document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
