import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Timer } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioDealOfWeek } from '../../models/portfolio.model';
import { ProductAdminService } from '@features/admin/products/data-access/product-admin.service';
import { ProductListItemDto } from '@features/catalog/models/product-admin.model';

@Component({
  selector: 'app-deal-of-week-editor-section',
  standalone: true,
  imports: [FormsModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailCardComponent, AdminDetailItemComponent],
  template: `
    <app-website-section-shell sectionId="dealOfWeek" title="Deal of the week" [icon]="icon" [complete]="!!draft()?.dealOfWeek?.productId">
      <div view class="admin-detail-view">
        <app-admin-detail-card [full]="true">
          <app-admin-detail-item [icon]="icon" label="Featured product" [value]="selectedProductName() || 'None selected'" />
        </app-admin-detail-card>
      </div>
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show deal of the week" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Product</span>
            <select class="pf-editor-input" [ngModel]="b.productId" (ngModelChange)="patch({ productId: $event })">
              <option value="">Select a product</option>
              @for (p of products(); track p.id) {
                <option [value]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Headline</span>
            <input class="pf-editor-input" [ngModel]="b.headline" (ngModelChange)="patch({ headline: $event })" placeholder="Deal of the week" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Ends on</span>
            <input class="pf-editor-input" type="date" [ngModel]="dateInputValue(b.endDate)" (ngModelChange)="patch({ endDate: $event })" />
          </div>
        }
      </div>
    </app-website-section-shell>
  `
})
export class DealOfWeekEditorSectionComponent implements OnInit {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);
  private readonly productApi = inject(ProductAdminService);

  readonly draft = this.state.draft;
  readonly icon = Timer;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioDealOfWeek>('dealOfWeek'));
  readonly products = signal<ProductListItemDto[]>([]);

  readonly selectedProductName = computed(() => {
    const id = this.draft()?.dealOfWeek?.productId;
    return this.products().find((p) => p.id === id)?.name ?? '';
  });

  ngOnInit(): void {
    this.productApi.list({ pageSize: 100 }).subscribe({
      next: (r) => this.products.set(r.items),
      error: () => this.products.set([])
    });
  }

  dateInputValue(iso?: string): string {
    return iso ? iso.slice(0, 10) : '';
  }

  patch(partial: Partial<PortfolioDealOfWeek>): void {
    this.sectionState.patchBuffer<PortfolioDealOfWeek>('dealOfWeek', (b) => ({ ...b, ...partial }));
  }
}
