import { Component, computed, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ShieldCheck, Users } from 'lucide-angular';

import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { AdminDetailMediaComponent } from '@features/admin/shared/admin-detail-media.component';

import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';

import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';

import { PortfolioStateService } from '../../data-access/portfolio-state.service';

import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';

import { PortfolioTrustBadges } from '../../models/portfolio.model';



@Component({

  selector: 'app-trust-badges-editor-section',

  standalone: true,

  imports: [FormsModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailCardComponent,
    AdminDetailItemComponent,
    AdminDetailMediaComponent],

  template: `

    <app-website-section-shell sectionId="trustBadges" title="Trust badges" [icon]="icon" [complete]="!!draft()?.trustBadges?.enabled">

      <div view class="admin-detail-view admin-detail-view--rich">

        <app-admin-detail-card [full]="true">

          <app-admin-detail-item

            [icon]="labelIcon"

            label="Customer count label"

            [value]="draft()?.trustBadges?.customerCountLabel"

          />

        </app-admin-detail-card>

      </div>

      <div edit class="pf-editor-fields">

        @if (buffer(); as b) {

          <app-section-toggle label="Show trust badges" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />

          <div class="pf-editor-field">

            <span class="pf-editor-label">Social proof label</span>

            <input class="pf-editor-input" [ngModel]="b.customerCountLabel" (ngModelChange)="patch({ customerCountLabel: $event })" placeholder="Trusted by 500+ customers" />

          </div>

          <div class="pf-payment-checkboxes">

            <label class="pf-payment-checkbox"><input type="checkbox" [checked]="b.freeShipping" (change)="patch({ freeShipping: $any($event.target).checked })" /> Free shipping</label>

            <label class="pf-payment-checkbox"><input type="checkbox" [checked]="b.securePayment" (change)="patch({ securePayment: $any($event.target).checked })" /> Secure payment</label>

            <label class="pf-payment-checkbox"><input type="checkbox" [checked]="b.moneyBack" (change)="patch({ moneyBack: $any($event.target).checked })" /> Money-back guarantee</label>

            <label class="pf-payment-checkbox"><input type="checkbox" [checked]="b.fastDelivery" (change)="patch({ fastDelivery: $any($event.target).checked })" /> Fast delivery</label>

          </div>

        }

      </div>

    </app-website-section-shell>

  `,

  styles: `

    .pf-payment-checkboxes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }

    .pf-payment-checkbox { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }

  `

})

export class TrustBadgesEditorSectionComponent {

  private readonly state = inject(PortfolioStateService);

  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;

  readonly icon = ShieldCheck;

  readonly labelIcon = Users;

  readonly buffer = computed(() => this.sectionState.buffer<PortfolioTrustBadges>('trustBadges'));



  patch(partial: Partial<PortfolioTrustBadges>): void {

    this.sectionState.patchBuffer<PortfolioTrustBadges>('trustBadges', (b) => ({ ...b, ...partial }));

  }

}

