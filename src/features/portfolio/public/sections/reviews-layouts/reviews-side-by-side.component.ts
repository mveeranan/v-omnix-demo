import { Component, signal, computed } from '@angular/core';
import { StarRatingComponent } from '../../../../store/shared/ui/star-rating.component';
import { ReviewsSectionBase } from './reviews-section-base';

/** Side-by-Side with Photo — large avatar circle on one side, quote + navigation on the other. */
@Component({
  selector: 'app-reviews-side-by-side',
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

          <div class="rv-split mt-12">
            <div class="rv-split__avatar">{{ active().authorName.charAt(0) || '?' }}</div>
            <div class="rv-split__content">
              @if (active().rating) {
                <app-star-rating [rating]="active().rating!" [showValue]="false" />
              }
              <p class="rv-split__message">"{{ active().message }}"</p>
              <p class="rv-split__author">
                {{ active().authorName }}
                @if (active().authorRole) {
                  <span class="rv-split__role">{{ active().authorRole }}</span>
                }
              </p>
              @if (feedbackItems().length > 1) {
                <div class="rv-split__nav">
                  <button type="button" (click)="prev()" aria-label="Previous review">&lsaquo;</button>
                  <button type="button" (click)="next()" aria-label="Next review">&rsaquo;</button>
                </div>
              }
            </div>
          </div>
        </div>
      </section>
    }
  `,
  styles: `
    .rv-split {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      max-width: 44rem;
      margin: 0 auto;
    }
    @media (min-width: 768px) { .rv-split { flex-direction: row; align-items: flex-start; } }

    .rv-split__avatar {
      flex: 0 0 auto;
      width: 6rem; height: 6rem;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      background: color-mix(in srgb, var(--mox-accent, #ff6f00) 12%, transparent);
      color: var(--mox-accent, #ff6f00);
      font-size: 1.75rem;
      font-weight: 700;
    }
    .rv-split__content { flex: 1; text-align: center; }
    @media (min-width: 768px) { .rv-split__content { text-align: left; } }

    .rv-split__message { margin-top: 0.75rem; font-size: 1.1rem; font-style: italic; line-height: 1.7; color: var(--mox-text, #23232d); }
    .rv-split__author { margin-top: 1rem; font-weight: 600; color: var(--mox-text, #23232d); }
    .rv-split__role { display: block; font-size: 0.85rem; font-weight: 400; color: var(--mox-muted, #8a8a8a); }
    .rv-split__nav { display: flex; gap: 0.75rem; margin-top: 1.25rem; justify-content: center; }
    @media (min-width: 768px) { .rv-split__nav { justify-content: flex-start; } }
    .rv-split__nav button {
      width: 2.5rem; height: 2.5rem;
      border: 1px solid var(--mox-border, #eaeaea);
      border-radius: 50%;
      background: var(--mox-surface, #fff);
      font-size: 1.4rem;
      cursor: pointer;
    }
  `
})
export class ReviewsSideBySideComponent extends ReviewsSectionBase {
  readonly activeIndex = signal(0);

  readonly active = computed(() => {
    const items = this.feedbackItems();
    const idx = Math.min(this.activeIndex(), items.length - 1);
    return items[Math.max(idx, 0)];
  });

  prev(): void {
    const len = this.feedbackItems().length;
    if (len) this.activeIndex.set((this.activeIndex() - 1 + len) % len);
  }

  next(): void {
    const len = this.feedbackItems().length;
    if (len) this.activeIndex.set((this.activeIndex() + 1) % len);
  }
}
