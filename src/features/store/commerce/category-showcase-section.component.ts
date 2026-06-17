import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { productCatalogStore } from '../data-access/product-catalog.store';
import { StoreProduct } from '../models/product.model';

interface CategoryCard {
  name: string;
  imageUrl: string;
  count: number;
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
            @for (cat of categories(); track cat.name) {
              <a
                class="mox-category-card"
                [routerLink]="categoryLink(cat.name)"
                [queryParams]="{ category: cat.name }"
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
export class CategoryShowcaseSectionComponent {
  readonly portfolio = input.required<Portfolio>();
  readonly storeSlug = input.required<string>();
  readonly enabled = input(true);

  readonly categories = computed((): CategoryCard[] => {
    if (!this.enabled() || !this.portfolio().categoryShowcase.enabled) return [];

    const products = productCatalogStore.getAll().filter((p) => p.status === 'active');
    const byCategory = new Map<string, StoreProduct[]>();
    for (const product of products) {
      const list = byCategory.get(product.category) ?? [];
      list.push(product);
      byCategory.set(product.category, list);
    }

    const allNames = [...byCategory.keys()].sort();
    const configured = this.portfolio().categoryShowcase.categoryNames.filter(Boolean);
    const names = configured.length > 0 ? configured : allNames;
    const max = this.portfolio().categoryShowcase.maxCount || 4;

    return names.slice(0, max).map((name) => {
      const categoryProducts = byCategory.get(name) ?? [];
      return {
        name,
        imageUrl:
          categoryProducts[0]?.imageUrl ??
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
        count: categoryProducts.length
      };
    });
  });

  categoryLink(_name: string): string[] {
    return ['/store', this.storeSlug(), 'products'];
  }
}
