import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '@features/portfolio/shared/directives/scroll-reveal.directive';
import { CategorySectionBase } from './category-layouts/category-section-base';

@Component({
  selector: 'app-category-showcase-section',
  standalone: true,
  imports: [RouterLink, ScrollRevealDirective],
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
          @if (categories().length >= 3) {
            <div class="msp-mosaic">
              <a
                class="msp-mosaic__tile msp-mosaic__tile--main"
                [routerLink]="['/store', storeSlug(), 'products']"
                [queryParams]="{ category: categories()[0].slug }"
                [style.background-image]="'url(' + categories()[0].imageUrl + ')'"
                appScrollReveal="slide-right"
              >
                <div class="msp-mosaic__text">
                  <span class="msp-mosaic__eyebrow">Shop</span>
                  <span class="msp-mosaic__label">{{ categories()[0].name }}</span>
                  <span class="msp-mosaic__cta">Shop now</span>
                </div>
              </a>
              <div class="msp-mosaic__stack">
                <a
                  class="msp-mosaic__tile msp-mosaic__tile--top"
                  [routerLink]="['/store', storeSlug(), 'products']"
                  [queryParams]="{ category: categories()[1].slug }"
                  [style.background-image]="'url(' + categories()[1].imageUrl + ')'"
                  appScrollReveal="slide-left"
                >
                  <div class="msp-mosaic__text">
                    <span class="msp-mosaic__eyebrow">Shop</span>
                    <span class="msp-mosaic__label">{{ categories()[1].name }}</span>
                    <span class="msp-mosaic__cta">Shop now</span>
                  </div>
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
                      <div class="msp-mosaic__text">
                        <span class="msp-mosaic__eyebrow">Shop</span>
                        <span class="msp-mosaic__label">{{ cat.name }}</span>
                        <span class="msp-mosaic__cta">Shop now</span>
                      </div>
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
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 700;
      color: var(--mox-text, #23232d);
    }
    .msp-section-head__rule {
      width: 3.5rem;
      height: 3px;
      background: var(--mox-accent, #ff6f00);
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
    .msp-cat-card:hover .msp-cat-card__label { color: var(--mox-accent, #ff6f00); }

    /* Matches the reference's asymmetric "choose" bento layout exactly:
       a 1/3-width tall card on the left, a 2/3-width stack on the right
       (one wide card over two half cards) — total height ~700px. */
    .msp-mosaic {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0;
    }
    @media (min-width: 900px) {
      .msp-mosaic { grid-template-columns: 1fr 2fr; align-items: stretch; }
    }
    .msp-mosaic__stack {
      display: flex;
      flex-direction: column;
    }
    .msp-mosaic__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      flex: 1;
    }
    .msp-mosaic__tile {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
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
      background: rgba(0, 0, 0, 0.32);
      transition: background 0.3s ease;
    }
    .msp-mosaic__tile:hover::before { background: rgba(0, 0, 0, 0.42); }
    .msp-mosaic__tile--main { min-height: 43.75rem; }
    .msp-mosaic__tile--top { min-height: 21.875rem; }
    .msp-mosaic__tile--half { min-height: 21.875rem; }

    .msp-mosaic__text {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 2rem;
      text-align: center;
      transition: transform 0.3s ease;
    }
    .msp-mosaic__tile:hover .msp-mosaic__text { transform: translateY(-4px); }
    /* Exact reference typography: .subheading (12px/600/4px tracking) + h2 (28px/700). */
    .msp-mosaic__eyebrow {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #fff;
    }
    .msp-mosaic__label {
      font-size: 1.75rem;
      font-weight: 700;
      color: #fff;
    }
    .msp-mosaic__cta {
      display: inline-flex;
      margin-top: 0.5rem;
      padding: 0.5rem 1.25rem;
      font-size: 0.8125rem;
      font-weight: 700;
      color: #fff;
      background: #000;
      border: 1px solid #000;
      border-radius: 999px;
      transition: background 0.2s ease, border-color 0.2s ease;
    }
    .msp-mosaic__tile:hover .msp-mosaic__cta {
      background: var(--mox-accent, #dbcc8f);
      border-color: var(--mox-accent, #dbcc8f);
    }
  `
})
export class CategoryShowcaseSectionComponent extends CategorySectionBase {}
