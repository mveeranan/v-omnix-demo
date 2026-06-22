import { Component, computed, inject, input, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { CatalogStorefrontApiService } from '@features/catalog/data-access/catalog-storefront-api.service';
import { CatalogProductListItemDto, catalogPrimaryImage } from '@features/catalog/models/catalog-storefront.model';

interface CategoryCard {
  name: string;
  slug: string;
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
            @for (cat of categories(); track cat.slug) {
              <a
                class="mox-category-card"
                [routerLink]="categoryLink()"
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
  private readonly products = signal<CatalogProductListItemDto[]>([]);
  private readonly catalogCategories = signal<{ name: string; slug: string }[]>([]);

  ngOnInit(): void {
    if (!this.enabled() || !this.portfolio().categoryShowcase.enabled) return;
    this.catalogApi.listProducts(this.storeSlug(), { pageSize: 100 }).subscribe({
      next: (r) => this.products.set(r.items)
    });
    this.catalogApi.listCategories(this.storeSlug()).subscribe({
      next: (cats) => {
        const flat: { name: string; slug: string }[] = [];
        const walk = (items: typeof cats) => {
          for (const c of items) {
            flat.push({ name: c.name, slug: c.slug });
            if (c.children?.length) walk(c.children);
          }
        };
        walk(cats);
        this.catalogCategories.set(flat);
      }
    });
  }

  readonly categories = computed((): CategoryCard[] => {
    if (!this.enabled() || !this.portfolio().categoryShowcase.enabled) return [];

    const configured = this.portfolio().categoryShowcase.categoryNames.filter(Boolean);
    const available = this.catalogCategories();
    const names =
      configured.length > 0
        ? configured
        : available.map((c) => c.name);
    const max = this.portfolio().categoryShowcase.maxCount || 4;

    return names.slice(0, max).map((name) => {
      const catMeta = available.find((c) => c.name === name);
      const slug = catMeta?.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const categoryProducts = this.products().filter(
        (p) => p.tags.includes(name) || false
      );
      const imageProduct = this.products()[0];
      return {
        name,
        slug,
        imageUrl: imageProduct ? catalogPrimaryImage(imageProduct) : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
        count: categoryProducts.length
      };
    });
  });

  categoryLink(): string[] {
    return ['/store', this.storeSlug(), 'products'];
  }
}
