import { Component, inject, input, OnInit, signal } from '@angular/core';
import { ReviewService, ProductReview } from '../data-access/review.service';
import { StarsRatingComponent } from '../../../shared/ui/stars-rating.component';

@Component({
  selector: 'app-product-reviews-section',
  standalone: true,
  imports: [StarsRatingComponent],
  template: `
    <section class="container mx-auto px-6 pb-16" id="reviews">
      <h2 class="pf-heading mb-6 text-xl font-semibold">Customer reviews</h2>

      @if (summary()) {
        <div class="mb-8 flex flex-wrap items-center gap-6">
          <app-stars-rating [rating]="summary()!.average" [reviewCount]="summary()!.count" />
          <div class="space-y-1 text-sm">
            @for (star of [5, 4, 3, 2, 1]; track star) {
              <div class="flex items-center gap-2">
                <span class="w-8">{{ star }}★</span>
                <div class="h-2 w-32 rounded bg-zinc-200 dark:bg-zinc-800">
                  <div class="h-full rounded bg-amber-400" [style.width.%]="barPercent(star)"></div>
                </div>
                <span class="text-[var(--text-muted)]">{{ summary()!.breakdown[star] || 0 }}</span>
              </div>
            }
          </div>
        </div>
      }

      @if (!reviews().length) {
        <p class="text-[var(--text-muted)]">No reviews yet.</p>
      } @else {
        <ul class="space-y-4">
          @for (r of reviews(); track r.id) {
            <li class="pf-glass-card rounded-xl p-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="font-medium">{{ r.authorName }}</span>
                <app-stars-rating [rating]="r.rating" [showValue]="false" />
              </div>
              <p class="mt-2 text-sm leading-relaxed">{{ r.text }}</p>
              <div class="mt-2 flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                <span>{{ formatDate(r.createdAt) }}</span>
                @if (r.verifiedPurchase) {
                  <span class="text-emerald-600">Verified purchase</span>
                }
              </div>
            </li>
          }
        </ul>
      }
    </section>
  `
})
export class ProductReviewsSectionComponent implements OnInit {
  readonly productId = input.required<string>();
  private readonly reviewApi = inject(ReviewService);

  readonly reviews = signal<ProductReview[]>([]);
  readonly summary = signal<{ average: number; count: number; breakdown: Record<number, number> } | null>(null);

  ngOnInit(): void {
    this.reviewApi.getReviews(this.productId()).subscribe((r) => this.reviews.set(r));
    this.reviewApi.getSummary(this.productId()).subscribe((s) => this.summary.set(s));
  }

  barPercent(star: number): number {
    const s = this.summary();
    if (!s || !s.count) return 0;
    return ((s.breakdown[star] ?? 0) / s.count) * 100;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
  }
}
