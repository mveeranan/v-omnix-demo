import { Component } from '@angular/core';
import { ReviewsSectionBase } from './reviews-section-base';

/** Marquee / Ticker Scroll — testimonials drift continuously in a single row. */
@Component({
  selector: 'app-reviews-marquee',
  standalone: true,
  imports: [],
  template: `
    @if (feedbackItems().length) {
      <section class="pf-section pf-section-alt" id="reviews">
        <div class="container mx-auto px-6">
          <div class="text-center">
            <p class="pf-eyebrow">Reviews</p>
            <h2 class="pf-display mt-2 text-3xl font-semibold md:text-4xl">{{ heading }}</h2>
          </div>
        </div>

        <div class="rv-marquee mt-12">
          <div class="rv-marquee__track">
            @for (item of doubledItems(); track $index) {
              <span class="rv-marquee__item">"{{ item.message }}" — {{ item.authorName }}</span>
            }
          </div>
        </div>
      </section>
    }
  `,
  styles: `
    .rv-marquee {
      overflow: hidden;
      border-top: 1px solid var(--mox-border, #eaeaea);
      border-bottom: 1px solid var(--mox-border, #eaeaea);
      padding: 1.25rem 0;
    }
    .rv-marquee__track {
      display: flex;
      gap: 3rem;
      width: max-content;
      animation: rv-marquee-scroll 30s linear infinite;
    }
    .rv-marquee__item {
      font-size: 0.95rem;
      font-style: italic;
      white-space: nowrap;
      color: var(--mox-text, #23232d);
    }
    @keyframes rv-marquee-scroll {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    @media (prefers-reduced-motion: reduce) {
      .rv-marquee__track { animation: none; }
    }
  `
})
export class ReviewsMarqueeComponent extends ReviewsSectionBase {
  /** Duplicate the list so the CSS scroll loop (translateX -50%) is seamless. */
  doubledItems() {
    const items = this.feedbackItems();
    return [...items, ...items];
  }
}
