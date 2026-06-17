import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageSquare, Plus, Trash2 } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { CollapsibleSectionCardComponent } from '@features/portfolio/shared/ui/collapsible-section-card.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { PortfolioReview } from '../../models/portfolio.model';

@Component({
  selector: 'app-reviews-editor-section',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, CollapsibleSectionCardComponent],
  template: `
    <app-collapsible-section-card title="Reviews" [icon]="icon" [complete]="(draft()?.reviews?.length ?? 0) > 0">
      @if (draft(); as d) {
        <div class="pf-editor-fields">
          @for (review of d.reviews; track review.id) {
            <div class="pf-editor-item-card">
              <div class="pf-editor-item-card__actions">
                <button type="button" class="text-red-500" (click)="remove(review.id)" aria-label="Remove review">
                  <lucide-icon [img]="trashIcon" class="h-4 w-4" />
                </button>
              </div>
              <div class="pf-editor-fields">
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Author</span>
                  <input class="pf-editor-input" [(ngModel)]="review.author" (ngModelChange)="sync()" />
                </div>
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Review</span>
                  <textarea
                    class="pf-editor-input pf-editor-textarea"
                    [(ngModel)]="review.text"
                    (ngModelChange)="sync()"
                  ></textarea>
                </div>
                <div class="pf-editor-field">
                  <span class="pf-editor-label">Rating (1–5)</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    class="pf-editor-input"
                    [(ngModel)]="review.rating"
                    (ngModelChange)="sync()"
                  />
                </div>
              </div>
            </div>
          }
          <button type="button" class="pf-editor-add-btn" (click)="add()">
            <lucide-icon [img]="plusIcon" class="h-4 w-4" /> Add review
          </button>
        </div>
      }
    </app-collapsible-section-card>
  `
})
export class ReviewsEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  readonly draft = this.state.draft;
  readonly icon = MessageSquare;
  readonly plusIcon = Plus;
  readonly trashIcon = Trash2;

  add(): void {
    const item: PortfolioReview = {
      id: crypto.randomUUID(),
      author: '',
      text: '',
      rating: 5,
      avatarUrl: ''
    };
    this.state.patchDraft((p) => ({ ...p, reviews: [...p.reviews, item] }));
  }

  remove(id: string): void {
    this.state.patchDraft((p) => ({ ...p, reviews: p.reviews.filter((r) => r.id !== id) }));
  }

  sync(): void {
    this.state.patchDraft((p) => ({ ...p }));
  }
}
