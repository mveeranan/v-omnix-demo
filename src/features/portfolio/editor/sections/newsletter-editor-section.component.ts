import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, Type } from 'lucide-angular';
import { AdminDetailFieldComponent } from '../../../admin/shared/admin-detail-field.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioNewsletter } from '../../models/portfolio.model';

@Component({
  selector: 'app-newsletter-editor-section',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailFieldComponent],
  template: `
    <app-website-section-shell sectionId="newsletter" title="Newsletter signup" [icon]="icon" [complete]="!!draft()?.newsletter?.heading">
      <div view class="admin-detail-view">
        <app-admin-detail-field label="Heading" [value]="draft()?.newsletter?.heading" />
        <app-admin-detail-field label="Subheading" [value]="draft()?.newsletter?.subheading" [span2]="true" />
      </div>
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show newsletter section" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Heading</span>
            <div class="pf-editor-input-wrap">
              <lucide-icon [img]="typeIcon" />
              <input class="pf-editor-input" [ngModel]="b.heading" (ngModelChange)="patch({ heading: $event })" />
            </div>
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Subheading</span>
            <div class="pf-editor-input-wrap">
              <lucide-icon [img]="typeIcon" />
              <input class="pf-editor-input" [ngModel]="b.subheading" (ngModelChange)="patch({ subheading: $event })" />
            </div>
          </div>
          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            <div class="pf-editor-field">
              <span class="pf-editor-label">Input placeholder</span>
              <div class="pf-editor-input-wrap">
                <lucide-icon [img]="mailIcon" />
                <input class="pf-editor-input" [ngModel]="b.placeholder" (ngModelChange)="patch({ placeholder: $event })" />
              </div>
            </div>
            <div class="pf-editor-field">
              <span class="pf-editor-label">Button label</span>
              <div class="pf-editor-input-wrap">
                <lucide-icon [img]="typeIcon" />
                <input class="pf-editor-input" [ngModel]="b.buttonLabel" (ngModelChange)="patch({ buttonLabel: $event })" />
              </div>
            </div>
          </div>
        }
      </div>
    </app-website-section-shell>
  `
})
export class NewsletterEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);
  readonly draft = this.state.draft;
  readonly icon = Mail;
  readonly typeIcon = Type;
  readonly mailIcon = Mail;
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioNewsletter>('newsletter'));

  patch(partial: Partial<PortfolioNewsletter>): void {
    this.sectionState.patchBuffer<PortfolioNewsletter>('newsletter', (b) => ({ ...b, ...partial }));
  }
}
