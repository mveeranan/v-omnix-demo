import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShieldCheck } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioTrustBadges } from '../../models/portfolio.model';

@Component({
  selector: 'app-trust-badges-editor-section',
  standalone: true,
  imports: [FormsModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailCardComponent, AdminDetailItemComponent],
  template: `
    <app-website-section-shell sectionId="trustBadges" title="Trust bar" [icon]="icon" [complete]="activeCount() > 0">
      <div view class="admin-detail-view">
        <app-admin-detail-card [full]="true">
          <app-admin-detail-item [icon]="icon" label="Active badges" [value]="activeCount() + ' of 4'" />
        </app-admin-detail-card>
      </div>
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show trust bar" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />
          <p class="pf-editor-hint">The row of reassurance badges shown under your hero banner.</p>
          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" [ngModel]="b.freeShipping" (ngModelChange)="patch({ freeShipping: $event })" /> Free shipping
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" [ngModel]="b.securePayment" (ngModelChange)="patch({ securePayment: $event })" /> Secure payment
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" [ngModel]="b.moneyBack" (ngModelChange)="patch({ moneyBack: $event })" /> Money-back guarantee
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" [ngModel]="b.fastDelivery" (ngModelChange)="patch({ fastDelivery: $event })" /> Fast delivery
            </label>
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Customer count label</span>
            <input class="pf-editor-input" [ngModel]="b.customerCountLabel" (ngModelChange)="patch({ customerCountLabel: $event })" placeholder="e.g. Loved by 10,000+ customers" />
          </div>
        }
      </div>
    </app-website-section-shell>
  `
})
export class TrustBadgesEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);
  readonly draft = this.state.draft;
  readonly icon = ShieldCheck;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioTrustBadges>('trustBadges'));

  activeCount(): number {
    const b = this.draft()?.trustBadges;
    if (!b) return 0;
    return [b.freeShipping, b.securePayment, b.moneyBack, b.fastDelivery].filter(Boolean).length;
  }

  patch(partial: Partial<PortfolioTrustBadges>): void {
    this.sectionState.patchBuffer<PortfolioTrustBadges>('trustBadges', (b) => ({ ...b, ...partial }));
  }
}
