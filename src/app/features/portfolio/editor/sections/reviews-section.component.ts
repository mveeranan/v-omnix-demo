import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageSquare, Plus, Trash2 } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { AdminDetailFieldComponent } from '../../../admin/shared/admin-detail-field.component';
import { SectionToggleComponent } from '../../shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '../shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService, ReviewsSectionBuffer } from '../../data-access/website-section-state.service';
import { PortfolioReview } from '../../models/portfolio.model';

@Component({
  selector: 'app-reviews-section',
  standalone: true,
  imports: [
    FormsModule,
    LucideAngularModule,
    WebsiteSectionShellComponent,
    SectionToggleComponent,
    AdminDetailFieldComponent
  ],
  template: `
    <app-website-section-shell
      sectionId="reviews"
      title="Reviews"
      [icon]="icon"
      [complete]="(draft()?.reviews?.length ?? 0) > 0"
    >
      <div view class="admin-detail-view">
        <app-admin-detail-field label="Total reviews" [value]="draft()?.reviews?.length ?? 0" />
        @for (review of draft()?.reviews?.slice(0, 3) ?? []; track review.id) {
          <app-admin-detail-field [label]="review.author" [value]="review.text" [span2]="true" />
        }
      </div>

      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle
            label="Show reviews section"
            [enabled]="b.reviewsSection.enabled"
            (enabledChange)="patchSection({ enabled: $event })"
          />
          @for (review of b.reviews; track review.id) {
            <div class="pf-editor-item-card">
              <div class="pf-editor-item-card__actions">
                <button type="button" class="text-red-500" (click)="remove(review.id)" aria-label="Remove review">
                  <lucide-icon [img]="trashIcon" class="h-4 w-4" />
                </button>
              </div>
              <div class="pf-editor-fields">
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Author</span>
                  <input class="pf-editor-input" [ngModel]="review.author" (ngModelChange)="update(review.id, { author: $event })" />
                </div>
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Review</span>
                  <textarea class="pf-editor-input pf-editor-textarea" [ngModel]="review.text" (ngModelChange)="update(review.id, { text: $event })"></textarea>
                </div>
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Rating (1–5)</span>
                  <input type="number" min="1" max="5" class="pf-editor-input" [ngModel]="review.rating" (ngModelChange)="update(review.id, { rating: +$event })" />
                </div>
              </div>
            </div>
          }
          <button type="button" class="pf-editor-add-btn" (click)="add()">
            <lucide-icon [img]="plusIcon" class="h-4 w-4" /> Add review
          </button>
        }
      </div>
    </app-website-section-shell>
  `
})
export class ReviewsSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = MessageSquare;
  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;
  readonly buffer = computed(() => this.sectionState.buffer<ReviewsSectionBuffer>('reviews'));

  patchSection(partial: Partial<ReviewsSectionBuffer['reviewsSection']>): void {
    this.sectionState.patchBuffer<ReviewsSectionBuffer>('reviews', (b) => ({
      ...b,
      reviewsSection: { ...b.reviewsSection, ...partial }
    }));
  }

  add(): void {
    const item: PortfolioReview = {
      id: crypto.randomUUID(),
      author: '',
      text: '',
      rating: 5,
      avatarUrl: ''
    };
    this.sectionState.patchBuffer<ReviewsSectionBuffer>('reviews', (b) => ({
      ...b,
      reviews: [...b.reviews, item]
    }));
  }

  update(id: string, partial: Partial<PortfolioReview>): void {
    this.sectionState.patchBuffer<ReviewsSectionBuffer>('reviews', (b) => ({
      ...b,
      reviews: b.reviews.map((r) => (r.id === id ? { ...r, ...partial } : r))
    }));
  }

  remove(id: string): void {
    this.sectionState.patchBuffer<ReviewsSectionBuffer>('reviews', (b) => ({
      ...b,
      reviews: b.reviews.filter((r) => r.id !== id)
    }));
  }
}
