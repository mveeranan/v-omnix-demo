import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BarChart3, Eye } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioStats } from '../../models/portfolio.model';

@Component({
  selector: 'app-stats-editor-section',
  standalone: true,
  imports: [FormsModule, WebsiteSectionShellComponent, SectionToggleComponent,
    AdminDetailCardComponent, AdminDetailItemComponent],
  template: `
    <app-website-section-shell sectionId="stats" title="Store stats" [icon]="icon" [complete]="!!buffer()?.enabled">
      <div view class="admin-detail-view admin-detail-view--rich">
        <div class="admin-detail-view__grid admin-detail-view__grid--2">
          <app-admin-detail-card>
            <app-admin-detail-item [icon]="visibleIcon" label="Visible" [value]="buffer()?.enabled ? 'Yes' : 'No'" />
          </app-admin-detail-card>
          <app-admin-detail-card>
            <app-admin-detail-item [icon]="visibleIcon" label="Years in business" [value]="buffer()?.yearsExperience?.toString() ?? '—'" />
          </app-admin-detail-card>
        </div>
      </div>
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show stats band" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />
          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            <div class="pf-editor-field">
              <span class="pf-editor-label">Total products</span>
              <input type="number" min="0" class="pf-editor-input" [ngModel]="b.totalProducts ?? 0" (ngModelChange)="patch({ totalProducts: +$event })" />
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Happy customers</span>
              <input type="number" min="0" class="pf-editor-input" [ngModel]="b.happyCustomers ?? 0" (ngModelChange)="patch({ happyCustomers: +$event })" />
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Years in business</span>
              <input type="number" min="0" class="pf-editor-input" [ngModel]="b.yearsExperience ?? 0" (ngModelChange)="patch({ yearsExperience: +$event })" />
            </div>
          </div>
        }
      </div>
    </app-website-section-shell>
  `
})
export class StatsEditorSectionComponent {
  private readonly sectionState = inject(WebsiteSectionStateService);
  readonly icon = BarChart3;
  readonly visibleIcon = Eye;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioStats>('stats'));

  patch(partial: Partial<PortfolioStats>): void {
    this.sectionState.patchBuffer<PortfolioStats>('stats', (s) => ({ ...s, ...partial }));
  }
}
