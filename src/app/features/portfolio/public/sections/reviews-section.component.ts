import { Component, input, OnDestroy, OnInit, signal } from '@angular/core';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { Portfolio } from '../../models/portfolio.model';
import { LucideAngularModule, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-angular';
import { StoreCardComponent } from '../../../store/shared/ui/store-card.component';
import { StoreSectionHeaderComponent } from '../../../store/shared/ui/store-section-header.component';
import { StarRatingComponent } from '../../../store/shared/ui/star-rating.component';
import { VerifiedBadgeComponent } from '../../../store/shared/ui/verified-badge.component';

@Component({
  selector: 'app-pf-reviews-section',
  standalone: true,
  imports: [
    ScrollRevealDirective,
    LucideAngularModule,
    StoreCardComponent,
    StoreSectionHeaderComponent,
    StarRatingComponent,
    VerifiedBadgeComponent
  ],
  templateUrl: './reviews-section.component.html'
})
export class ReviewsSectionComponent implements OnInit, OnDestroy {
  readonly portfolio = input.required<Portfolio>();
  readonly activeIndex = signal(0);
  readonly chevronLeft = ChevronLeft;
  readonly chevronRight = ChevronRight;
  readonly sectionIcon = MessageSquare;

  private intervalId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.intervalId = setInterval(() => this.next(), 6000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  prev(): void {
    const len = this.portfolio().reviews.length;
    if (!len) return;
    this.activeIndex.update((i) => (i - 1 + len) % len);
  }

  next(): void {
    const len = this.portfolio().reviews.length;
    if (!len) return;
    this.activeIndex.update((i) => (i + 1) % len);
  }
}
