import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategorySectionBase } from './category-section-base';

/** Masonry Grid — mixed-height tiles in a CSS columns masonry flow. */
@Component({
  selector: 'app-category-masonry',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (enabled() && categories().length) {
      <section class="msp-cats" id="categories">
        <div class="container mx-auto px-6">
          <header class="msp-section-head">
            <h2 class="msp-section-head__title">{{ heading }}</h2>
            <span class="msp-section-head__rule" aria-hidden="true"></span>
            @if (subtitle) {
              <p class="msp-section-head__subtitle">{{ subtitle }}</p>
            }
          </header>
          <div class="cat-masonry">
            @for (cat of categories(); track cat.slug; let i = $index) {
              <a
                class="cat-masonry__tile"
                [class.cat-masonry__tile--tall]="i % 3 === 0"
                [routerLink]="['/store', storeSlug(), 'products']"
                [queryParams]="{ category: cat.slug }"
                [style.background-image]="'url(' + cat.imageUrl + ')'"
              >
                <span class="cat-masonry__label">{{ cat.name }}</span>
              </a>
            }
          </div>
        </div>
      </section>
    }
  `,
  styles: `
    .msp-cats { padding: 4.5rem 0; background: var(--mox-bg, #fff); }
    .msp-section-head {
      display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
      margin-bottom: 2.75rem; text-align: center;
    }
    .msp-section-head__title {
      margin: 0; font-family: var(--mox-font-heading, inherit);
      font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 700; color: var(--mox-text, #23232d);
    }
    .msp-section-head__rule { width: 3.5rem; height: 3px; background: var(--mox-accent, #ff6f00); border-radius: 999px; }
    .msp-section-head__subtitle { margin: 0; max-width: 34rem; font-size: 0.95rem; color: var(--mox-muted, #8a8a8a); }

    .cat-masonry {
      column-count: 2;
      column-gap: 1.25rem;
    }
    @media (min-width: 768px) { .cat-masonry { column-count: 3; } }
    @media (min-width: 1100px) { .cat-masonry { column-count: 4; } }

    .cat-masonry__tile {
      position: relative;
      display: flex;
      align-items: flex-end;
      break-inside: avoid;
      margin-bottom: 1.25rem;
      height: 14rem;
      border-radius: var(--mox-radius, 6px);
      overflow: hidden;
      text-decoration: none;
      background-size: cover;
      background-position: center;
    }
    .cat-masonry__tile--tall { height: 20rem; }
    .cat-masonry__tile::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 55%);
    }
    .cat-masonry__tile:hover { box-shadow: 0 12px 28px rgba(0,0,0,0.18); }
    .cat-masonry__label {
      position: relative; z-index: 1;
      padding: 1rem; width: 100%; text-align: center;
      font-size: 1rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #fff;
    }
  `
})
export class CategoryMasonryComponent extends CategorySectionBase {}
