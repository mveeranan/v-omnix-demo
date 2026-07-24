import { Directive, computed, input, signal } from '@angular/core';
import { Portfolio, PortfolioGalleryItem } from '../../../models/portfolio.model';

/**
 * Shared data logic for every Gallery layout variant.
 *
 * Reads its config from portfolio.gallerySection (heading, item limit, layout
 * style) and portfolio.gallery (the actual media items), sorts by sortOrder,
 * and applies the item limit. Concrete layouts extend this and provide only
 * template + styles; the lightbox open/close state lives here once so every
 * layout gets "click to expand" for free.
 */
@Directive()
export abstract class GallerySectionBase {
  readonly portfolio = input.required<Portfolio>();
  readonly enabled = input(true);
  /** Unused by gallery layouts — declared only to absorb the dispatcher's shared input contract. */
  readonly storeSlug = input<string>('');

  readonly lightboxItem = signal<PortfolioGalleryItem | null>(null);

  protected get section() {
    return this.portfolio().gallerySection;
  }

  /** Heading: admin's custom display name, else the original default ("Product showcase" — the eyebrow above already reads "Gallery"). */
  get heading(): string {
    return this.section.displayName?.trim() || 'Product showcase';
  }

  private get limit(): number | undefined {
    return this.section.itemLimit;
  }

  /** Gallery items, sorted and sliced to the admin's item limit (undefined = show all). */
  readonly items = computed<PortfolioGalleryItem[]>(() => {
    if (!this.enabled() || !this.section.enabled) return [];
    const sorted = [...this.portfolio().gallery].sort((a, b) => a.sortOrder - b.sortOrder);
    return this.limit ? sorted.slice(0, this.limit) : sorted;
  });

  openLightbox(item: PortfolioGalleryItem): void {
    this.lightboxItem.set(item);
  }

  closeLightbox(): void {
    this.lightboxItem.set(null);
  }
}
