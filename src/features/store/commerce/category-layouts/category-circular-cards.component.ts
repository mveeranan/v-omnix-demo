import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategorySectionBase } from './category-section-base';

/** Circular Category Cards — round thumbnails with labels underneath. */
@Component({
  selector: 'app-category-circular-cards',
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
          <div class="cat-circles">
            @for (cat of categories(); track cat.slug) {
              <a
                class="cat-circle"
                [routerLink]="['/store', storeSlug(), 'products']"
                [queryParams]="{ category: cat.slug }"
              >
                <span class="cat-circle__media" [style.background-image]="'url(' + cat.imageUrl + ')'"></span>
                <span class="cat-circle__label">{{ cat.name }}</span>
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

    .cat-circles {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 2rem 2.5rem;
    }
    .cat-circle {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.9rem;
      width: 8.5rem;
      text-decoration: none;
    }
    .cat-circle__media {
      width: 8.5rem;
      height: 8.5rem;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      border: 3px solid var(--mox-border, #eaeaea);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s ease, border-color 0.3s ease;
    }
    .cat-circle:hover .cat-circle__media {
      transform: scale(1.05);
      border-color: var(--mox-accent, #ff6f00);
    }
    .cat-circle__label {
      font-size: 0.9rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-align: center;
      color: var(--mox-text, #23232d);
      transition: color 0.2s ease;
    }
    .cat-circle:hover .cat-circle__label { color: var(--mox-accent, #ff6f00); }
  `
})
export class CategoryCircularCardsComponent extends CategorySectionBase {}
