import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategorySectionBase } from './category-section-base';

/** List View — vertical, text-forward rows with a small thumbnail. */
@Component({
  selector: 'app-category-list',
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
          <ul class="cat-list">
            @for (cat of categories(); track cat.slug) {
              <li>
                <a
                  class="cat-list__row"
                  [routerLink]="['/store', storeSlug(), 'products']"
                  [queryParams]="{ category: cat.slug }"
                >
                  <span class="cat-list__media" [style.background-image]="'url(' + cat.imageUrl + ')'"></span>
                  <span class="cat-list__label">{{ cat.name }}</span>
                  <span class="cat-list__arrow" aria-hidden="true">&rarr;</span>
                </a>
              </li>
            }
          </ul>
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

    .cat-list {
      list-style: none;
      margin: 0 auto;
      padding: 0;
      max-width: 44rem;
      border-top: 1px solid var(--mox-border, #eaeaea);
    }
    .cat-list__row {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.1rem 0.75rem;
      border-bottom: 1px solid var(--mox-border, #eaeaea);
      text-decoration: none;
      transition: background 0.2s ease, padding-left 0.2s ease;
    }
    .cat-list__row:hover { background: var(--mox-surface, #f7f7f7); padding-left: 1.25rem; }
    .cat-list__media {
      flex: 0 0 auto;
      width: 3.25rem;
      height: 3.25rem;
      border-radius: var(--mox-radius, 6px);
      background-size: cover;
      background-position: center;
    }
    .cat-list__label {
      flex: 1;
      font-size: 1.05rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--mox-text, #23232d);
    }
    .cat-list__arrow {
      font-size: 1.2rem;
      color: var(--mox-muted, #8a8a8a);
      transition: transform 0.2s ease, color 0.2s ease;
    }
    .cat-list__row:hover .cat-list__arrow { transform: translateX(4px); color: var(--mox-accent, #ff6f00); }
  `
})
export class CategoryListComponent extends CategorySectionBase {}
