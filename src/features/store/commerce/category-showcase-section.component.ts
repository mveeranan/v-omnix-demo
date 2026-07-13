import { Component, computed, inject, input, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Portfolio } from '../../portfolio/models/portfolio.model';
import { CatalogStorefrontApiService } from '@features/catalog/data-access/catalog-storefront-api.service';
import { CatalogCategoryDto } from '@features/catalog/models/catalog-storefront.model';
import { ScrollRevealDirective } from '@features/portfolio/shared/directives/scroll-reveal.directive';

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
  imports: [RouterLink, ScrollRevealDirective],
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
          @if (categories().length >= 3) {
            <div class="msp-mosaic">
              <a
                class="msp-mosaic__tile msp-mosaic__tile--main"
                [routerLink]="['/store', storeSlug(), 'products']"
                [queryParams]="{ category: categories()[0].slug }"
                [style.background-image]="'url(' + categories()[0].imageUrl + ')'"
                appScrollReveal="slide-right"
              >
                <span class="msp-mosaic__label">{{ categories()[0].name }}</span>
              </a>
              <div class="msp-mosaic__stack">
                <a
                  class="msp-mosaic__tile msp-mosaic__tile--top"
                  [routerLink]="['/store', storeSlug(), 'products']"
                  [queryParams]="{ category: categories()[1].slug }"
                  [style.background-image]="'url(' + categories()[1].imageUrl + ')'"
                  appScrollReveal="slide-left"
                >
                  <span class="msp-mosaic__label">{{ categories()[1].name }}</span>
                </a>
                <div class="msp-mosaic__row">
                  @for (cat of categories().slice(2, 4); track cat.slug; let i = $index) {
                    <a
                      class="msp-mosaic__tile msp-mosaic__tile--half"
                      [routerLink]="['/store', storeSlug(), 'products']"
                      [queryParams]="{ category: cat.slug }"
                      [style.background-image]="'url(' + cat.imageUrl + ')'"
                      appScrollReveal="scale-in"
                      [appScrollRevealDelay]="i * 100"
                    >
                      <span class="msp-mosaic__label">{{ cat.name }}</span>
                    </a>
                  }
                </div>
              </div>
            </div>
          } @else {
            <div class="msp-cats__grid">
              @for (cat of categories(); track cat.slug) {
                <a
                  class="msp-cat-card"
                  [routerLink]="['/store', storeSlug(), 'products']"
                  [queryParams]="{ category: cat.slug }"
                >
                  <span class="msp-cat-card__media">
                    <img
                      [src]="cat.imageUrl"
                      [alt]="cat.name"
                      loading="lazy"
                      onerror="this.style.display='none'; this.parentElement.style.backgroundImage='url(data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2220%22%3ENo Image%3C/text%3E%3C/svg%3E)'"
                    />
                  </span>
                  <span class="msp-cat-card__label">{{ cat.name }}</span>
                </a>
              }
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .msp-cats { padding: 4.5rem 0; background: var(--mox-bg, #fff); }

    .msp-section-head {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 2.75rem;
      text-align: center;
    }
    .msp-section-head__title {
      margin: 0;
      font-family: var(--mox-font-heading, inherit);
      font-size: clamp(1.6rem, 3.2vw, 2.1rem);
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
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 4 / 3;
      overflow: hidden;
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
      background-size: cover;
      background-position: center;
    }
    .msp-cat-card__media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      background: white;
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

    .msp-mosaic {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (min-width: 900px) {
      .msp-mosaic { grid-template-columns: 1.6fr 1fr; align-items: stretch; }
    }
    .msp-mosaic__stack {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .msp-mosaic__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      flex: 1;
    }
    .msp-mosaic__tile {
      position: relative;
      display: flex;
      align-items: flex-end;
      background-size: cover;
      background-position: center;
      overflow: hidden;
      text-decoration: none;
      transition: box-shadow 0.3s ease;
    }
    .msp-mosaic__tile::after {
      content: '';
      position: absolute;
      inset: -4%;
      background: inherit;
      background-size: cover;
      background-position: center;
      transform: scale(1);
      transition: transform 0.6s ease;
      z-index: -1;
    }
    .msp-mosaic__tile:hover::after { transform: scale(1.08); }
    .msp-mosaic__tile::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(0deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.05) 55%);
      transition: background 0.3s ease;
    }
    .msp-mosaic__tile:hover::before { background: rgba(0, 0, 0, 0.4); }
    .msp-mosaic__label {
      transition: transform 0.3s ease;
    }
    .msp-mosaic__tile:hover .msp-mosaic__label { transform: translateY(-4px); }
    .msp-mosaic__tile--main { min-height: 22rem; }
    .msp-mosaic__tile--top { min-height: 10rem; }
    .msp-mosaic__tile--half { min-height: 10rem; }
    .msp-mosaic__label {
      position: relative;
      z-index: 1;
      padding: 1.5rem;
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #fff;
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

      // Debug: Log categories with missing images
      if (!meta?.imageUrl) {
        console.debug(`Category "${name}" has no API image, using fallback:`, imageUrl);
      }

      return { name, slug, imageUrl };
    });
  });
}
