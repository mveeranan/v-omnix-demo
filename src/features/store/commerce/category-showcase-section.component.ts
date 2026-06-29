import { Component, computed, inject, input, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { CatalogStorefrontApiService } from '@features/catalog/data-access/catalog-storefront-api.service';
import { CatalogCategoryDto } from '@features/catalog/models/catalog-storefront.model';

// Generic category fallback images (Unsplash, different by index)
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

interface CategoryCard {
  name: string;
  slug: string;
  imageUrl: string;
}

@Component({
  selector: 'app-category-showcase-section',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (enabled() && categories().length) {
      <section class="mox-section" id="categories">
        <div class="container mx-auto px-6">
          <header class="mox-sale-section__header mb-8 text-center">
            <h2 class="mox-sale-section__title">{{ portfolio().categoryShowcase.title }}</h2>
            @if (portfolio().categoryShowcase.subtitle) {
              <p class="mox-sale-section__subtitle">{{ portfolio().categoryShowcase.subtitle }}</p>
            }
          </header>
          <div class="mox-category-grid">
            @for (cat of categories(); track cat.slug; let i = $index) {
              <a
                class="mox-category-card"
                [routerLink]="['/store', storeSlug(), 'products']"
                [queryParams]="{ category: cat.slug }"
              >
                <img class="mox-category-card__img" [src]="cat.imageUrl" [alt]="cat.name" loading="lazy" />
                <p class="mox-category-card__label">{{ cat.name }}</p>
              </a>
            }
          </div>
        </div>
      </section>
    }
  `
})
export class CategoryShowcaseSectionComponent implements OnInit {
  readonly portfolio = input.required<Portfolio>();
  readonly storeSlug = input.required<string>();
  readonly enabled = input(true);

  private readonly catalogApi = inject(CatalogStorefrontApiService);
  private readonly allCategories = signal<CatalogCategoryDto[]>([]);

  ngOnInit(): void {
    if (!this.enabled() || !this.portfolio().categoryShowcase.enabled) return;
    this.catalogApi.listCategories(this.storeSlug()).subscribe({
      next: (cats) => this.allCategories.set(cats)
    });
  }

  readonly categories = computed((): CategoryCard[] => {
    if (!this.enabled() || !this.portfolio().categoryShowcase.enabled) return [];

    // Flatten nested categories
    const flat: { name: string; slug: string }[] = [];
    const walk = (items: CatalogCategoryDto[]) => {
      for (const c of items) {
        flat.push({ name: c.name, slug: c.slug });
        if (c.children?.length) walk(c.children);
      }
    };
    walk(this.allCategories());

    const configured = this.portfolio().categoryShowcase.categoryNames.filter(Boolean);
    const max = this.portfolio().categoryShowcase.maxCount || 4;

    const names = configured.length > 0
      ? configured.slice(0, max)
      : flat.map((c) => c.name).slice(0, max);

    return names.map((name, index) => {
      const meta = flat.find((c) => c.name === name);
      const slug = meta?.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const imageUrl = CATEGORY_FALLBACKS[index % CATEGORY_FALLBACKS.length];
      return { name, slug, imageUrl };
    });
  });
}
