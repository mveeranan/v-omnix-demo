import { Component, computed, inject, input, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { CatalogStorefrontApiService } from '@features/catalog/data-access/catalog-storefront-api.service';
import { CatalogCategoryDto } from '@features/catalog/models/catalog-storefront.model';

// Fallback images shown when a category has no image set
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
      <section class="msp-cats" id="categories">
        <div class="container mx-auto px-6">
          <header class="msp-section-head">
            <h2 class="msp-section-head__title">{{ portfolio().categoryShowcase.title }}</h2>
            <span class="msp-section-head__rule" aria-hidden="true"></span>
            @if (portfolio().categoryShowcase.subtitle) {
              <p class="msp-section-head__subtitle">{{ portfolio().categoryShowcase.subtitle }}</p>
            }
          </header>
          <div class="msp-cats__grid">
            @for (cat of categories(); track cat.slug) {
              <a
                class="msp-cat-card"
                [routerLink]="['/store', storeSlug(), 'products']"
                [queryParams]="{ category: cat.slug }"
              >
                <span class="msp-cat-card__media">
                  <img [src]="cat.imageUrl" [alt]="cat.name" loading="lazy" />
                </span>
                <span class="msp-cat-card__label">{{ cat.name }}</span>
              </a>
            }
          </div>
        </div>
      </section>
    }
  `,
  styles: `
    .msp-cats { padding: 4rem 0; background: var(--mox-bg, #fff); }

    .msp-section-head {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 2.5rem;
      text-align: center;
    }
    .msp-section-head__title {
      margin: 0;
      font-family: var(--mox-font-heading, inherit);
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 700;
      color: var(--mox-text, #23232d);
    }
    .msp-section-head__rule {
      width: 3.5rem;
      height: 3px;
      background: var(--mox-accent, #fe4c50);
      border-radius: 999px;
    }
    .msp-section-head__subtitle {
      margin: 0;
      max-width: 34rem;
      font-size: 0.95rem;
      color: var(--mox-muted, #8a8a8a);
    }

    .msp-cats__grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }
    @media (min-width: 768px) {
      .msp-cats__grid { grid-template-columns: repeat(4, 1fr); }
    }

    .msp-cat-card {
      display: flex;
      flex-direction: column;
      background: var(--mox-surface, #fff);
      border: 1px solid var(--mox-border, #eaeaea);
      border-radius: var(--mox-radius, 4px);
      overflow: hidden;
      text-decoration: none;
      transition: box-shadow 0.25s ease, transform 0.25s ease;
    }
    .msp-cat-card:hover {
      box-shadow: 0 10px 26px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
    .msp-cat-card__media {
      display: block;
      aspect-ratio: 4 / 3;
      overflow: hidden;
    }
    .msp-cat-card__media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .msp-cat-card:hover .msp-cat-card__media img { transform: scale(1.06); }
    .msp-cat-card__label {
      padding: 0.85rem 1rem;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      text-align: center;
      color: var(--mox-text, #23232d);
      border-top: 1px solid var(--mox-border, #eaeaea);
      transition: color 0.2s ease;
    }
    .msp-cat-card:hover .msp-cat-card__label { color: var(--mox-accent, #fe4c50); }
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

  readonly categories = computed((): CategoryCard[] => {
    if (!this.enabled() || !this.portfolio().categoryShowcase.enabled) return [];

    const available = this.allCategories();
    const configured = this.portfolio().categoryShowcase.categoryNames.filter(Boolean);
    const max = this.portfolio().categoryShowcase.maxCount || 4;

    const names = configured.length > 0
      ? configured.slice(0, max)
      : available.map((c) => c.name).slice(0, max);

    return names.map((name, index) => {
      const meta = available.find((c) => c.name === name);
      const slug = meta?.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      // Use real category image if set, else fallback by index
      const imageUrl = meta?.imageUrl || CATEGORY_FALLBACKS[index % CATEGORY_FALLBACKS.length];
      return { name, slug, imageUrl };
    });
  });
}
