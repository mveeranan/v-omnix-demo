import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Mail } from 'lucide-angular';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService } from '../../data-access/website-section-state.service';
import { PortfolioNewsletter } from '../../models/portfolio.model';

@Component({
  selector: 'app-newsletter-editor-section',
  standalone: true,
  imports: [FormsModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailCardComponent, AdminDetailItemComponent],
  template: `
    <app-website-section-shell sectionId="newsletter" title="Newsletter signup" [icon]="icon" [complete]="!!draft()?.newsletter?.heading">
      <div view class="admin-detail-view">
        <app-admin-detail-card [full]="true">
          <app-admin-detail-item [icon]="icon" label="Heading" [value]="draft()?.newsletter?.heading || '—'" />
        </app-admin-detail-card>
      </div>
      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle label="Show newsletter signup" [enabled]="b.enabled" (enabledChange)="patch({ enabled: $event })" />
          <div class="pf-editor-field">
            <span class="pf-editor-label">Heading</span>
            <input class="pf-editor-input" [ngModel]="b.heading" (ngModelChange)="patch({ heading: $event })" placeholder="Never miss a deal" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Subheading</span>
            <input class="pf-editor-input" [ngModel]="b.subheading" (ngModelChange)="patch({ subheading: $event })" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Input placeholder</span>
            <input class="pf-editor-input" [ngModel]="b.placeholder" (ngModelChange)="patch({ placeholder: $event })" placeholder="Your email address" />
          </div>
          <div class="pf-editor-field">
            <span class="pf-editor-label">Button label</span>
            <input class="pf-editor-input" [ngModel]="b.buttonLabel" (ngModelChange)="patch({ buttonLabel: $event })" placeholder="Subscribe" />
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
  readonly buffer = computed(() => this.sectionState.buffer<PortfolioNewsletter>('newsletter'));

  patch(partial: Partial<PortfolioNewsletter>): void {
    this.sectionState.patchBuffer<PortfolioNewsletter>('newsletter', (b) => ({ ...b, ...partial }));
  }
}
