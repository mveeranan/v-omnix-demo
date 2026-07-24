import { Component, signal } from '@angular/core';
import { ScrollRevealDirective } from '@features/portfolio/shared/directives/scroll-reveal.directive';
import { LucideAngularModule, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-angular';
import { StoreCardComponent } from '../../../store/shared/ui/store-card.component';
import { StoreSectionHeaderComponent } from '../../../store/shared/ui/store-section-header.component';
import { StarRatingComponent } from '../../../store/shared/ui/star-rating.component';
import { ReviewsSectionBase } from './reviews-layouts/reviews-section-base';

@Component({
  selector: 'app-pf-reviews-section',
  standalone: true,
  imports: [
    ScrollRevealDirective,
    LucideAngularModule,
    StoreCardComponent,
    StoreSectionHeaderComponent,
    StarRatingComponent
  ],
  template: `
    @if (feedbackItems().length) {
      <section class="pf-section pf-section-alt" id="reviews">
        <div class="container mx-auto px-6">
          <div appScrollReveal>
            <app-store-section-header eyebrow="Reviews" [title]="heading" [icon]="sectionIcon" />
          </div>
          <div appScrollReveal="slide-right" [appScrollRevealDelay]="100" class="relative mx-auto mt-12 max-w-2xl">
            @for (item of feedbackItems(); track item.id; let i = $index) {
              @if (activeIndex() === i) {
                <app-store-card class="block p-8 text-center">
                  <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--pf-accent)]/10 text-lg font-semibold text-[var(--pf-accent)]">
                    {{ item.authorName.charAt(0) || '?' }}
                  </div>
                  @if (item.rating) {
                    <app-star-rating [rating]="item.rating" [showValue]="false" />
                  }
                  <p class="pf-text mt-4 text-lg italic leading-relaxed">"{{ item.message }}"</p>
                  <p class="mt-6 font-medium pf-accent-text">— {{ item.authorName }}
                    @if (item.authorRole) {
                      <span class="block text-sm font-normal text-[var(--pf-text-muted)]">{{ item.authorRole }}</span>
                    }
                  </p>
                </app-store-card>
              }
            }
            @if (feedbackItems().length > 1) {
              <div class="mt-6 flex items-center justify-center gap-4">
                <button type="button" class="pf-icon-btn" (click)="prev()" aria-label="Previous review">
                  <lucide-icon [img]="chevronLeft" class="h-5 w-5" />
                </button>
                <div class="flex gap-2">
                  @for (item of feedbackItems(); track item.id; let i = $index) {
                    <button
                      type="button"
                      class="h-2 w-2 rounded-full transition-all"
                      [style.background]="activeIndex() === i ? 'var(--pf-btn-bg, var(--pf-accent))' : 'currentColor'"
                      [style.opacity]="activeIndex() === i ? '1' : '0.3'"
                      (click)="activeIndex.set(i)"
                      [attr.aria-label]="'Go to review ' + (i + 1)"
                    ></button>
                  }
                </div>
                <button type="button" class="pf-icon-btn" (click)="next()" aria-label="Next review">
                  <lucide-icon [img]="chevronRight" class="h-5 w-5" />
                </button>
              </div>
            }
          </div>
        </div>
      </section>
    }
  `
})
export class ReviewsSectionComponent extends ReviewsSectionBase {
  readonly activeIndex = signal(0);
  readonly chevronLeft = ChevronLeft;
  readonly chevronRight = ChevronRight;
  readonly sectionIcon = MessageSquare;

  protected override onFeedbackLoaded(): void {
    if (this.feedbackItems().length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.intervalId = setInterval(() => this.next(), 6000);
    }
  }

  prev(): void {
    const len = this.feedbackItems().length;
    if (!len) return;
    this.activeIndex.update((i) => (i - 1 + len) % len);
  }

  next(): void {
    const len = this.feedbackItems().length;
    if (!len) return;
    this.activeIndex.update((i) => (i + 1) % len);
  }
}
