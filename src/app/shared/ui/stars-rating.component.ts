import { Component, computed, input } from '@angular/core';
import { LucideAngularModule, Star } from 'lucide-angular';

@Component({
  selector: 'app-stars-rating',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="inline-flex items-center gap-1" [attr.aria-label]="rating() + ' out of 5 stars'">
      @for (star of stars(); track $index) {
        <lucide-icon
          [img]="starIcon"
          class="h-4 w-4"
          [class.text-amber-400]="star === 'full'"
          [class.text-amber-300]="star === 'half'"
          [class.text-zinc-300]="star === 'empty'"
          [class.fill-amber-400]="star === 'full'"
          [class.fill-amber-300]="star === 'half'"
        />
      }
      @if (showValue()) {
        <span class="ml-1 text-sm font-medium text-[var(--text-primary)]">{{ rating().toFixed(1) }}</span>
      }
      @if (reviewCount() != null) {
        <span class="text-sm text-[var(--text-muted)]">({{ reviewCount() }})</span>
      }
    </div>
  `
})
export class StarsRatingComponent {
  readonly rating = input(0);
  readonly reviewCount = input<number | null>(null);
  readonly showValue = input(true);
  readonly starIcon = Star;

  readonly stars = computed(() => {
    const r = Math.max(0, Math.min(5, this.rating()));
    const result: ('full' | 'half' | 'empty')[] = [];
    for (let i = 1; i <= 5; i++) {
      if (r >= i) result.push('full');
      else if (r >= i - 0.5) result.push('half');
      else result.push('empty');
    }
    return result;
  });
}
