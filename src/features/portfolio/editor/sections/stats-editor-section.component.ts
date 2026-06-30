import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BarChart3, Eye, Package } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioStats } from '../../models/portfolio.model';

@Component({
  selector: 'app-stats-editor-section',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, WebsiteSectionShellComponent, SectionToggleComponent,
    AdminDetailCardComponent, AdminDetailItemComponent],
  template: `
    <app-website-section-shell sectionId="stats" title="Store stats" [icon]="icon" [complete]="!!buffer()?.enabled">
      <div view class="admin-detail-view admin-detail-view--rich">
        <div class="admin-detail-view__grid admin-detail-view__grid--2">
          <app-admin-detail-card>
            <app-admin-detail-item [icon]="visibleIcon" label="Visible" [value]="buffer()?.enabled ? 'Yes' : 'No'" />
          </app-admin-detail-card>
          <app-admin-detail-card>
            <app-admin-detail-item [icon]="productIcon" label="Products (auto)" [value]="(buffer()?.totalProducts ?? 0).toString()" />
          </app-admin-detail-card>
        </div>
      </div>
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show stats band" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />

          <!-- Read-only: auto-populated from backend product count -->
          <div class="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3 text-sm">
            <div class="flex items-center gap-2 text-[var(--text-muted)]">
              <lucide-icon [img]="productIcon" [size]="14" />
              <span>Total products is auto-calculated from your live catalog ({{ b.totalProducts }} active products).</span>
            </div>
          </div>

          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            <div class="pf-editor-field">
              <span class="pf-editor-label">Years in business</span>
              <input type="number" min="0" class="pf-editor-input"
                [ngModel]="b.yearsExperience" (ngModelChange)="patch({ yearsExperience: +$event })" />
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Happy customers</span>
              <input type="number" min="0" class="pf-editor-input"
                [ngModel]="b.happyCustomers" (ngModelChange)="patch({ happyCustomers: +$event, totalCustomers: +$event })" />
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Orders completed</span>
              <input type="number" min="0" class="pf-editor-input"
                [ngModel]="b.totalOrders" (ngModelChange)="patch({ totalOrders: +$event })" />
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Total customers</span>
              <input type="number" min="0" class="pf-editor-input"
                [ngModel]="b.totalCustomers" (ngModelChange)="patch({ totalCustomers: +$event })" />
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
  readonly productIcon = Package;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioStats>('stats'));

  patch(partial: Partial<PortfolioStats>): void {
    this.sectionState.patchBuffer<PortfolioStats>('stats', (s) => ({ ...s, ...partial }));
  }
}
