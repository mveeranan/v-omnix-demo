import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategorySectionBase } from './category-section-base';

/** Large Banner Categories — full-width banner blocks stacked vertically. */
@Component({
  selector: 'app-category-large-banner',
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
          <div class="cat-banners">
            @for (cat of categories(); track cat.slug) {
              <a
                class="cat-banner"
                [routerLink]="['/store', storeSlug(), 'products']"
                [queryParams]="{ category: cat.slug }"
                [style.background-image]="'url(' + cat.imageUrl + ')'"
              >
                <span class="cat-banner__text">
                  <span class="cat-banner__eyebrow">Shop</span>
                  <span class="cat-banner__label">{{ cat.name }}</span>
                  <span class="cat-banner__cta">Shop now</span>
                </span>
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

    .cat-banners { display: flex; flex-direction: column; gap: 1.25rem; }
    .cat-banner {
      position: relative;
      display: flex;
      align-items: center;
      min-height: 14rem;
      padding: 2.5rem;
      border-radius: var(--mox-radius, 8px);
      overflow: hidden;
      text-decoration: none;
      background-size: cover;
      background-position: center;
    }
    .cat-banner::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 70%);
      transition: background 0.3s ease;
    }
    .cat-banner:hover::before { background: linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.2) 70%); }
    .cat-banner__text {
      position: relative; z-index: 1;
      display: flex; flex-direction: column; gap: 0.5rem;
    }
    .cat-banner__eyebrow { font-size: 0.75rem; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: #fff; }
    .cat-banner__label { font-size: clamp(1.5rem, 3vw, 2.25rem); font-weight: 700; color: #fff; }
    .cat-banner__cta {
      display: inline-flex; align-self: flex-start; margin-top: 0.5rem;
      padding: 0.55rem 1.4rem; font-size: 0.8125rem; font-weight: 700;
      color: #fff; background: rgba(0,0,0,0.55); border: 1px solid #fff; border-radius: 999px;
      transition: background 0.2s ease, color 0.2s ease;
    }
    .cat-banner:hover .cat-banner__cta { background: var(--mox-accent, #ff6f00); border-color: var(--mox-accent, #ff6f00); }
  `
})
export class CategoryLargeBannerComponent extends CategorySectionBase {}
