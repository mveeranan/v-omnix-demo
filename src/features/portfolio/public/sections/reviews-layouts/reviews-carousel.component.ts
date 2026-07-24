import { Component } from '@angular/core';
import { StarRatingComponent } from '../../../../store/shared/ui/star-rating.component';
import { ReviewsSectionBase } from './reviews-section-base';

/** Carousel/Slider — a horizontally swipeable row of testimonial cards (not auto-rotating single-spotlight). */
@Component({
  selector: 'app-reviews-carousel',
  standalone: true,
  imports: [StarRatingComponent],
  template: `
    @if (feedbackItems().length) {
      <section class="pf-section pf-section-alt" id="reviews">
        <div class="container mx-auto px-6">
          <div class="text-center">
            <p class="pf-eyebrow">Reviews</p>
            <h2 class="pf-display mt-2 text-3xl font-semibold md:text-4xl">{{ heading }}</h2>
          </div>
        </div>

        <div class="rv-carousel mt-12" role="list">
          @for (item of feedbackItems(); track item.id) {
            <div class="rv-carousel__cell" role="listitem">
              @if (item.rating) {
                <app-star-rating [rating]="item.rating" [showValue]="false" />
              }
              <p class="rv-carousel__message">"{{ item.message }}"</p>
              <p class="rv-carousel__author">{{ item.authorName }}</p>
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .rv-carousel {
      display: flex;
      gap: 1.25rem;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding: 0 1.5rem 1rem;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }
    .rv-carousel__cell {
      flex: 0 0 auto;
      width: 20rem;
      scroll-snap-align: start;
      padding: 1.5rem;
      background: var(--mox-surface, #fff);
      border: 1px solid var(--mox-border, #eaeaea);
      border-radius: var(--mox-radius, 8px);
    }
    .rv-carousel__message { margin-top: 0.6rem; font-size: 0.9rem; font-style: italic; line-height: 1.6; color: var(--mox-text, #23232d); }
    .rv-carousel__author { margin-top: 0.6rem; font-weight: 600; color: var(--mox-text, #23232d); }
    @media (max-width: 640px) { .rv-carousel__cell { width: 78vw; } }
  `
})
export class ReviewsCarouselComponent extends ReviewsSectionBase {}
