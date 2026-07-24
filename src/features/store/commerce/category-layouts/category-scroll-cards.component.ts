import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategorySectionBase } from './category-section-base';

/** Horizontal Scroll Cards — a swipeable row of image cards. */
@Component({
  selector: 'app-category-scroll-cards',
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
          <div class="cat-scroll" role="list">
            @for (cat of categories(); track cat.slug) {
              <a
                class="cat-scroll__card"
                role="listitem"
                [routerLink]="['/store', storeSlug(), 'products']"
                [queryParams]="{ category: cat.slug }"
                [style.background-image]="'url(' + cat.imageUrl + ')'"
              >
                <span class="cat-scroll__label">{{ cat.name }}</span>
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

    .cat-scroll {
      display: flex;
      gap: 1.25rem;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: 1rem;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }
    .cat-scroll__card {
      position: relative;
      flex: 0 0 auto;
      width: 15rem;
      height: 18rem;
      scroll-snap-align: start;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      border-radius: var(--mox-radius, 6px);
      overflow: hidden;
      text-decoration: none;
      background-size: cover;
      background-position: center;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .cat-scroll__card::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 55%);
    }
    .cat-scroll__card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.16); }
    .cat-scroll__label {
      position: relative; z-index: 1;
      padding: 1rem; width: 100%; text-align: center;
      font-size: 1rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      color: #fff;
    }
  `
})
export class CategoryScrollCardsComponent extends CategorySectionBase {}
