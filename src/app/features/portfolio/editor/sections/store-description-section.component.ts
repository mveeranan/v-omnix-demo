import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileText } from 'lucide-angular';
import { AdminDetailFieldComponent } from '../../../admin/shared/admin-detail-field.component';
import { SectionToggleComponent } from '../../shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '../shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioStoreDescription } from '../../models/portfolio.model';

@Component({
  selector: 'app-store-description-section',
  standalone: true,
  imports: [FormsModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailFieldComponent],
  template: `
    <app-website-section-shell
      sectionId="storeDescription"
      title="Store Description"
      [icon]="icon"
      [complete]="!!draft()?.storeDescription?.description"
    >
      <div view class="admin-detail-view">
        <app-admin-detail-field label="Description" [value]="draft()?.storeDescription?.description" [span2]="true" />
      </div>

      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle
            label="Show store description section"
            [enabled]="b.enabled"
            (enabledChange)="patch({ enabled: $event })"
          />
          <div class="pf-editor-field">
            <span class="pf-editor-label">What do you sell?</span>
            <textarea
              class="pf-editor-input pf-editor-textarea"
              [ngModel]="b.description"
              (ngModelChange)="patch({ description: $event })"
              rows="4"
              placeholder="Describe your products and what makes your store unique..."
            ></textarea>
          </div>
        }
      </div>
    </app-website-section-shell>
  `
})
export class StoreDescriptionSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = FileText;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioStoreDescription>('storeDescription'));

  patch(partial: Partial<PortfolioStoreDescription>): void {
    this.sectionState.patchBuffer<PortfolioStoreDescription>('storeDescription', (b) => ({ ...b, ...partial }));
  }
}
