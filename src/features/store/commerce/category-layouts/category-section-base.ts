import { Directive, computed, inject, input, signal, OnInit } from '@angular/core';
import { Portfolio } from '../../../portfolio/models/portfolio.model';
import { CatalogStorefrontApiService } from '@features/catalog/data-access/catalog-storefront-api.service';
import { CatalogCategoryDto } from '@features/catalog/models/catalog-storefront.model';

/** A single resolved category tile, ready to render in any layout. */
export interface CategoryCard {
  name: string;
  slug: string;
  imageUrl: string;
}

/** Fallback images shown when a category has no image set. */
const CATEGORY_FALLBACKS = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80'
];

/**
 * Shared data logic for every Categories layout variant.
 *
 * Concrete layout components extend this and provide only a template + styles;
 * all catalog fetching, item-limit slicing, and heading resolution live here
 * once. This is the "reusable component" pattern from the design doc — a new
 * layout is presentation-only, never a re-implementation of the data plumbing.
 */
@Directive()
export abstract class CategorySectionBase implements OnInit {
  readonly portfolio = input.required<Portfolio>();
  readonly storeSlug = input.required<string>();
  readonly enabled = input(true);

  protected readonly catalogApi = inject(CatalogStorefrontApiService);
  private readonly allCategories = signal<CatalogCategoryDto[]>([]);

  ngOnInit(): void {
    if (!this.enabled() || !this.portfolio().categoryShowcase.enabled) return;
    this.catalogApi.listCategories(this.storeSlug()).subscribe({
      next: (cats) => {
        const flat: CatalogCategoryDto[] = [];
        const walk = (items: CatalogCategoryDto[]) => {
          for (const c of items) {
            flat.push(c);
            if (c.children?.length) walk(c.children);
          }
        };
        walk(cats);
        this.allCategories.set(flat);
      }
    });
  }

  /** The raw categoryShowcase config block from the portfolio. */
  protected get section() {
    return this.portfolio().categoryShowcase;
  }

  /** Heading text: admin's custom display name, else the stored title. */
  get heading(): string {
    return this.section.displayName?.trim() || this.section.title;
  }

  get subtitle(): string {
    return this.section.subtitle;
  }

  /**
   * Resolved, display-limited category cards. Honors the admin's itemLimit
   * (how many to SHOW) independently of how many were selected; falls back to
   * the legacy maxCount, then to 4.
   */
  readonly categories = computed<CategoryCard[]>(() => {
    if (!this.enabled() || !this.section.enabled) return [];

    const available = this.allCategories();
    const configured = this.section.categoryNames.filter(Boolean);
    const limit = this.section.itemLimit ?? this.section.maxCount ?? 4;

    const names = configured.length > 0
      ? configured.slice(0, limit)
      : available.map((c) => c.name).slice(0, limit);

    return names.map((name, index) => {
      const meta = available.find((c) => c.name === name);
      const slug = meta?.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const imageUrl = meta?.imageUrl || CATEGORY_FALLBACKS[index % CATEGORY_FALLBACKS.length];
      return { name, slug, imageUrl };
    });
  });
}
