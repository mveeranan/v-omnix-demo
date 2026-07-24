import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategorySectionBase } from './category-section-base';

/** Carousel / Slider — one large category slide at a time with prev/next + dots. */
@Component({
  selector: 'app-category-carousel',
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

          <div class="cat-carousel">
            <button type="button" class="cat-carousel__nav cat-carousel__nav--prev"
              (click)="prev()" aria-label="Previous category">&lsaquo;</button>

            <a
              class="cat-carousel__slide"
              [routerLink]="['/store', storeSlug(), 'products']"
              [queryParams]="{ category: active().slug }"
              [style.background-image]="'url(' + active().imageUrl + ')'"
            >
              <span class="cat-carousel__text">
                <span class="cat-carousel__eyebrow">Shop</span>
                <span class="cat-carousel__label">{{ active().name }}</span>
                <span class="cat-carousel__cta">Shop now</span>
              </span>
            </a>

            <button type="button" class="cat-carousel__nav cat-carousel__nav--next"
              (click)="next()" aria-label="Next category">&rsaquo;</button>
          </div>

          @if (categories().length > 1) {
            <div class="cat-carousel__dots">
              @for (cat of categories(); track cat.slug; let i = $index) {
                <button type="button" class="cat-carousel__dot"
                  [class.is-active]="activeIndex() === i"
                  (click)="goTo(i)" [attr.aria-label]="'Go to ' + cat.name"></button>
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
      display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
      margin-bottom: 2.75rem; text-align: center;
    }
    .msp-section-head__title {
      margin: 0; font-family: var(--mox-font-heading, inherit);
      font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 700; color: var(--mox-text, #23232d);
    }
    .msp-section-head__rule { width: 3.5rem; height: 3px; background: var(--mox-accent, #ff6f00); border-radius: 999px; }
    .msp-section-head__subtitle { margin: 0; max-width: 34rem; font-size: 0.95rem; color: var(--mox-muted, #8a8a8a); }

    .cat-carousel {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .cat-carousel__slide {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 24rem;
      border-radius: var(--mox-radius, 8px);
      overflow: hidden;
      text-decoration: none;
      background-size: cover;
      background-position: center;
    }
    .cat-carousel__slide::before {
      content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.35);
    }
    .cat-carousel__text {
      position: relative; z-index: 1;
      display: flex; flex-direction: column; align-items: center; gap: 0.6rem; text-align: center;
    }
    .cat-carousel__eyebrow { font-size: 0.75rem; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: #fff; }
    .cat-carousel__label { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 700; color: #fff; }
    .cat-carousel__cta {
      display: inline-flex; margin-top: 0.5rem; padding: 0.6rem 1.6rem;
      font-size: 0.85rem; font-weight: 700; color: #fff;
      background: var(--mox-accent, #ff6f00); border-radius: 999px;
    }
    .cat-carousel__nav {
      flex: 0 0 auto;
      width: 3rem; height: 3rem;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.75rem; line-height: 1;
      color: var(--mox-text, #23232d);
      background: var(--mox-surface, #fff);
      border: 1px solid var(--mox-border, #eaeaea);
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease;
    }
    .cat-carousel__nav:hover { background: var(--mox-accent, #ff6f00); color: #fff; border-color: var(--mox-accent, #ff6f00); }

    .cat-carousel__dots { display: flex; justify-content: center; gap: 0.5rem; margin-top: 1.5rem; }
    .cat-carousel__dot {
      width: 0.6rem; height: 0.6rem; padding: 0;
      border: none; border-radius: 50%;
      background: var(--mox-border, #d4d4d4); cursor: pointer;
      transition: background 0.2s ease, transform 0.2s ease;
    }
    .cat-carousel__dot.is-active { background: var(--mox-accent, #ff6f00); transform: scale(1.3); }
  `
})
export class CategoryCarouselComponent extends CategorySectionBase {
  readonly activeIndex = signal(0);

  /** Current slide, clamped in case itemLimit shrank the list below the index. */
  readonly active = computed(() => {
    const cats = this.categories();
    const idx = Math.min(this.activeIndex(), cats.length - 1);
    return cats[Math.max(idx, 0)];
  });

  next(): void {
    const len = this.categories().length;
    if (len) this.activeIndex.set((this.activeIndex() + 1) % len);
  }

  prev(): void {
    const len = this.categories().length;
    if (len) this.activeIndex.set((this.activeIndex() - 1 + len) % len);
  }

  goTo(i: number): void {
    this.activeIndex.set(i);
  }
}
