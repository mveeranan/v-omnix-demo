import { Component, computed, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { CreditCard, Wallet } from 'lucide-angular';

import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { AdminDetailMediaComponent } from '@features/admin/shared/admin-detail-media.component';

import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';

import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';

import { PortfolioStateService } from '../../data-access/portfolio-state.service';

import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';

import { PortfolioPaymentMethods } from '../../models/portfolio.model';



@Component({

  selector: 'app-payment-methods-section',

  standalone: true,

  imports: [FormsModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailCardComponent,
    AdminDetailItemComponent,
    AdminDetailMediaComponent],

  template: `

    <app-website-section-shell

      sectionId="paymentMethods"

      title="Payment Methods"

      [icon]="icon"

      [complete]="enabledMethods().length > 0"

    >

      <div view class="admin-detail-view admin-detail-view--rich">

        <app-admin-detail-card [full]="true">

          <app-admin-detail-item

            [icon]="methodsIcon"

            label="Accepted methods"

            [value]="enabledMethods().join(', ') || '—'"

          />

        </app-admin-detail-card>

      </div>



      <div edit class="pf-editor-fields">

        @if (buffer(); as b) {

          <app-section-toggle

            label="Show payment methods on storefront"

            [enabled]="b.enabled"

            (enabledChange)="patch({ enabled: $event })"

          />

          <div class="pf-payment-checkboxes">

            @for (method of methods; track method.key) {

              <label class="pf-payment-checkbox">

                <input

                  type="checkbox"

                  [checked]="b[method.key]"

                  (change)="toggleMethod(method.key, $any($event.target).checked)"

                />

                {{ method.label }}

              </label>

            }

          </div>

        }

      </div>

    </app-website-section-shell>

  `,

  styles: `

    .pf-payment-checkboxes {

      display: grid;

      grid-template-columns: repeat(2, 1fr);

      gap: 0.75rem;

    }



    @media (max-width: 640px) {

      .pf-payment-checkboxes {

        grid-template-columns: 1fr;

      }

    }



    .pf-payment-checkbox {

      display: flex;

      align-items: center;

      gap: 0.5rem;

      font-size: 0.875rem;

      cursor: pointer;

    }

  `

})

export class PaymentMethodsSectionComponent {

  private readonly state = inject(PortfolioStateService);

  private readonly sectionState = inject(WebsiteSectionStateService);



  readonly draft = this.state.draft;

  readonly icon = CreditCard;

  readonly methodsIcon = Wallet;



  readonly methods = [

    { key: 'upi' as const, label: 'UPI' },

    { key: 'card' as const, label: 'Card' },

    { key: 'cod' as const, label: 'Cash on Delivery' },

    { key: 'wallet' as const, label: 'Wallet' }

  ];



  readonly buffer = computed(() => this.sectionState.buffer<PortfolioPaymentMethods>('paymentMethods'));



  readonly enabledMethods = computed(() => {

    const pm = this.draft()?.paymentMethods;

    if (!pm) return [];

    const labels: string[] = [];

    if (pm.upi) labels.push('UPI');

    if (pm.card) labels.push('Card');

    if (pm.cod) labels.push('COD');

    if (pm.wallet) labels.push('Wallet');

    return labels;

  });



  patch(partial: Partial<PortfolioPaymentMethods>): void {

    this.sectionState.patchBuffer<PortfolioPaymentMethods>('paymentMethods', (b) => ({ ...b, ...partial }));

  }



  toggleMethod(key: keyof Pick<PortfolioPaymentMethods, 'upi' | 'card' | 'cod' | 'wallet'>, checked: boolean): void {

    this.patch({ [key]: checked });

  }

}

