import { Component } from '@angular/core';
import { StarRatingComponent } from '../../../../store/shared/ui/star-rating.component';
import { ReviewsSectionBase } from './reviews-section-base';

/** Card Grid (3-up) — testimonials as a row of cards, no rotation, all visible at once. */
@Component({
  selector: 'app-reviews-card-grid',
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
          <div class="rv-grid mt-12">
            @for (item of feedbackItems(); track item.id) {
              <div class="rv-card">
                <div class="rv-card__avatar">{{ item.authorName.charAt(0) || '?' }}</div>
                @if (item.rating) {
                  <app-star-rating [rating]="item.rating" [showValue]="false" />
                }
                <p class="rv-card__message">"{{ item.message }}"</p>
                <p class="rv-card__author">
                  {{ item.authorName }}
                  @if (item.authorRole) {
                    <span class="rv-card__role">{{ item.authorRole }}</span>
                  }
                </p>
              </div>
            }
          </div>
        </div>
      </section>
    }
  `,
  styles: `
    .rv-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (min-width: 768px) { .rv-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1100px) { .rv-grid { grid-template-columns: repeat(3, 1fr); } }

    .rv-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      padding: 1.75rem;
      text-align: center;
      background: var(--mox-surface, #fff);
      border: 1px solid var(--mox-border, #eaeaea);
      border-radius: var(--mox-radius, 8px);
    }
    .rv-card__avatar {
      width: 3rem; height: 3rem;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      background: color-mix(in srgb, var(--mox-accent, #ff6f00) 12%, transparent);
      color: var(--mox-accent, #ff6f00);
      font-weight: 700;
    }
    .rv-card__message { font-size: 0.95rem; font-style: italic; line-height: 1.6; color: var(--mox-text, #23232d); }
    .rv-card__author { font-weight: 600; color: var(--mox-text, #23232d); }
    .rv-card__role { display: block; font-size: 0.8rem; font-weight: 400; color: var(--mox-muted, #8a8a8a); }
  `
})
export class ReviewsCardGridComponent extends ReviewsSectionBase {}
