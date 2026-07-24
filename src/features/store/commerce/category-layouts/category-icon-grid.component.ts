import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategorySectionBase } from './category-section-base';

/** Small Icon Grid — compact image tiles in a dense responsive grid. */
@Component({
  selector: 'app-category-icon-grid',
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
          <div class="cat-icons">
            @for (cat of categories(); track cat.slug) {
              <a
                class="cat-icon"
                [routerLink]="['/store', storeSlug(), 'products']"
                [queryParams]="{ category: cat.slug }"
              >
                <span class="cat-icon__media" [style.background-image]="'url(' + cat.imageUrl + ')'"></span>
                <span class="cat-icon__label">{{ cat.name }}</span>
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

    .cat-icons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    @media (min-width: 640px) { .cat-icons { grid-template-columns: repeat(4, 1fr); } }
    @media (min-width: 900px) { .cat-icons { grid-template-columns: repeat(6, 1fr); } }

    .cat-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      padding: 1rem 0.5rem;
      border-radius: var(--mox-radius, 6px);
      text-decoration: none;
      transition: background 0.2s ease;
    }
    .cat-icon:hover { background: var(--mox-surface, #f7f7f7); }
    .cat-icon__media {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 12px;
      background-size: cover;
      background-position: center;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.25s ease;
    }
    .cat-icon:hover .cat-icon__media { transform: scale(1.08); }
    .cat-icon__label {
      font-size: 0.75rem;
      font-weight: 600;
      text-align: center;
      color: var(--mox-text, #23232d);
      line-height: 1.3;
    }
  `
})
export class CategoryIconGridComponent extends CategorySectionBase {}
