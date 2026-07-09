import { Component, computed, inject } from '@angular/core';
import { MessageSquare } from 'lucide-angular';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioReviewsSection } from '../../models/portfolio.model';

@Component({
  selector: 'app-reviews-editor-section',
  standalone: true,
  imports: [WebsiteSectionShellComponent, SectionToggleComponent],
  template: `
    <app-website-section-shell sectionId="reviewsSection" title="Customer reviews" [icon]="icon" [complete]="true">
      <div view class="admin-detail-view">
        <p class="admin-detail-empty">
          Shows real customer feedback automatically — nothing to write here.
          {{ draft()?.reviewsSection?.enabled ? 'Currently visible on your homepage.' : 'Currently hidden.' }}
        </p>
      </div>
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show customer reviews section" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />
          <p class="pf-editor-hint">
            Pulls in real feedback your customers have already left — there's no content to author here, just whether the section appears on your homepage.
          </p>
        }
      </div>
    </app-website-section-shell>
  `
})
export class ReviewsEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);
  readonly draft = this.state.draft;
  readonly icon = MessageSquare;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioReviewsSection>('reviewsSection'));

  patch(partial: Partial<PortfolioReviewsSection>): void {
    this.sectionState.patchBuffer<PortfolioReviewsSection>('reviewsSection', (b) => ({ ...b, ...partial }));
  }
}
