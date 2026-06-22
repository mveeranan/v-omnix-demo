import { Component, computed, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Clock, FileText, RotateCcw, Truck } from 'lucide-angular';

import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { AdminDetailMediaComponent } from '@features/admin/shared/admin-detail-media.component';

import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';

import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';

import { PortfolioStateService } from '../../data-access/portfolio-state.service';

import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';

import { PortfolioStorePolicies } from '../../models/portfolio.model';



@Component({

  selector: 'app-store-policies-editor-section',

  standalone: true,

  imports: [FormsModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailCardComponent,
    AdminDetailItemComponent,
    AdminDetailMediaComponent],

  template: `

    <app-website-section-shell sectionId="storePolicies" title="Store policies" [icon]="icon" [complete]="!!draft()?.storePolicies?.returnPolicy">

      <div view class="admin-detail-view admin-detail-view--rich">

        <app-admin-detail-card [full]="true">

          <app-admin-detail-item

            [icon]="returnPolicyIcon"

            label="Return policy"

            [value]="draft()?.storePolicies?.returnPolicy"

            [multiline]="true"

            [divider]="true"

          />

          <app-admin-detail-item

            [icon]="shippingIcon"

            label="Shipping"

            [value]="draft()?.storePolicies?.shippingInfo"

            [multiline]="true"

            [divider]="true"

          />

          <app-admin-detail-item

            [icon]="deliveryIcon"

            label="Delivery time"

            [value]="draft()?.storePolicies?.deliveryTime"

          />

        </app-admin-detail-card>

      </div>

      <div edit class="pf-editor-fields">

        @if (buffer(); as b) {

          <app-section-toggle label="Show policies section" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />

          <div class="pf-editor-field">

            <span class="pf-editor-label">Return policy</span>

            <textarea class="pf-editor-input pf-editor-textarea" [ngModel]="b.returnPolicy" (ngModelChange)="patch({ returnPolicy: $event })"></textarea>

          </div>

          <div class="pf-editor-field">

            <span class="pf-editor-label">Shipping info</span>

            <textarea class="pf-editor-input pf-editor-textarea" [ngModel]="b.shippingInfo" (ngModelChange)="patch({ shippingInfo: $event })"></textarea>

          </div>

          <div class="pf-editor-field">

            <span class="pf-editor-label">Delivery time</span>

            <input class="pf-editor-input" [ngModel]="b.deliveryTime" (ngModelChange)="patch({ deliveryTime: $event })" />

          </div>

        }

      </div>

    </app-website-section-shell>

  `

})

export class StorePoliciesEditorSectionComponent {

  private readonly state = inject(PortfolioStateService);

  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;

  readonly icon = FileText;

  readonly returnPolicyIcon = RotateCcw;

  readonly shippingIcon = Truck;

  readonly deliveryIcon = Clock;

  readonly buffer = computed(() => this.sectionState.buffer<PortfolioStorePolicies>('storePolicies'));



  patch(partial: Partial<PortfolioStorePolicies>): void {

    this.sectionState.patchBuffer<PortfolioStorePolicies>('storePolicies', (b) => ({ ...b, ...partial }));

  }

}

