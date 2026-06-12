import { Component, computed, input } from '@angular/core';
import { LucideAngularModule, Star } from 'lucide-angular';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="star-rating" [attr.aria-label]="ariaLabel()">
      @for (i of stars(); track i) {
        <lucide-icon
          [img]="starIcon"
          class="h-4 w-4"
          [class.star-rating__star--filled]="i <= filledCount()"
          [class.star-rating__star]="i > filledCount()"
        />
      }
      @if (showValue()) {
        <span class="pf-text-muted ml-1 text-sm font-medium">{{ rating().toFixed(1) }}</span>
      }
      @if (reviewCount() != null) {
        <span class="pf-text-muted text-sm">({{ reviewCount() }})</span>
      }
    </div>
  `
})
export class StarRatingComponent {
  readonly rating = input(5);
  readonly maxStars = input(5);
  readonly reviewCount = input<number | null>(null);
  readonly showValue = input(true);

  readonly starIcon = Star;

  readonly stars = computed(() => Array.from({ length: this.maxStars() }, (_, i) => i + 1));
  readonly filledCount = computed(() => Math.round(Math.min(this.maxStars(), Math.max(0, this.rating()))));

  ariaLabel(): string {
    const count = this.reviewCount();
    const suffix = count != null ? ` from ${count} reviews` : '';
    return `Rating ${this.rating().toFixed(1)} out of ${this.maxStars()}${suffix}`;
  }
}
