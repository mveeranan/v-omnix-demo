import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Headphones } from 'lucide-angular';
import { AdminDetailFieldComponent } from '../../../admin/shared/admin-detail-field.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioContactSupport } from '../../models/portfolio.model';

@Component({
  selector: 'app-contact-support-section',
  standalone: true,
  imports: [FormsModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailFieldComponent],
  template: `
    <app-website-section-shell
      sectionId="contactSupport"
      title="Contact & Support"
      [icon]="icon"
      [complete]="!!draft()?.contactSupport?.email || !!draft()?.contactSupport?.phone"
    >
      <div view class="admin-detail-view">
        <div class="admin-detail-view__grid admin-detail-view__grid--2">
          <app-admin-detail-field label="Phone" [value]="draft()?.contactSupport?.phone" />
          <app-admin-detail-field label="Email" [value]="draft()?.contactSupport?.email" />
        </div>
        <app-admin-detail-field label="Support hours" [value]="draft()?.contactSupport?.supportHours" />
      </div>

      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle
            label="Show contact & support section"
            [enabled]="b.enabled"
            (enabledChange)="patch({ enabled: $event })"
          />
          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            <div class="pf-editor-field">
              <span class="pf-editor-label">Phone (10 digits)</span>
              <input class="pf-editor-input" [ngModel]="b.phone" (ngModelChange)="patch({ phone: $event })" placeholder="9876543210" />
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Email</span>
              <input type="email" class="pf-editor-input" [ngModel]="b.email" (ngModelChange)="patch({ email: $event })" />
            </div>
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Support hours</span>
            <input class="pf-editor-input" [ngModel]="b.supportHours" (ngModelChange)="patch({ supportHours: $event })" placeholder="Mon–Sat, 9 AM – 6 PM" />
          </div>
        }
      </div>
    </app-website-section-shell>
  `
})
export class ContactSupportSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = Headphones;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioContactSupport>('contactSupport'));

  patch(partial: Partial<PortfolioContactSupport>): void {
    this.sectionState.patchBuffer<PortfolioContactSupport>('contactSupport', (b) => ({ ...b, ...partial }));
  }
}
