import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BarChart3 } from 'lucide-angular';
import { AdminDetailFieldComponent } from '../../../admin/shared/admin-detail-field.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioStats } from '../../models/portfolio.model';

@Component({
  selector: 'app-stats-editor-section',
  standalone: true,
  imports: [FormsModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailFieldComponent],
  template: `
    <app-website-section-shell sectionId="stats" title="Store stats" [icon]="icon" [complete]="!!buffer()?.enabled">
      <div view class="admin-detail-view">
        <app-admin-detail-field label="Visible" [value]="buffer()?.enabled ? 'Yes' : 'No'" />
        <app-admin-detail-field label="Orders completed" [value]="displayOrders()" />
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
              <span class="pf-editor-label">Orders completed</span>
              <input type="number" min="0" class="pf-editor-input" [ngModel]="ordersValue(b)" (ngModelChange)="patchOrders(+$event)" />
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Total customers</span>
              <input type="number" min="0" class="pf-editor-input" [ngModel]="b.totalCustomers ?? b.happyCustomers ?? 0" (ngModelChange)="patch({ totalCustomers: +$event, happyCustomers: +$event })" />
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Years in business</span>
              <input type="number" min="0" class="pf-editor-input" [ngModel]="b.yearsExperience" (ngModelChange)="patch({ yearsExperience: +$event })" />
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
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioStats>('stats'));

  displayOrders(): string {
    const b = this.buffer();
    if (!b) return '—';
    return String(b.totalOrders ?? b.ordersCompleted ?? b.bookingsCompleted ?? 0);
  }

  ordersValue(b: PortfolioStats): number {
    return b.totalOrders ?? b.ordersCompleted ?? b.bookingsCompleted ?? 0;
  }

  patch(partial: Partial<PortfolioStats>): void {
    this.sectionState.patchBuffer<PortfolioStats>('stats', (s) => ({ ...s, ...partial }));
  }

  patchOrders(value: number): void {
    this.patch({ totalOrders: value, ordersCompleted: value, bookingsCompleted: value });
  }
}
