import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Share2 } from 'lucide-angular';
import { CollapsibleSectionCardComponent } from '@features/portfolio/shared/ui/collapsible-section-card.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';

@Component({
  selector: 'app-social-editor-section',
  standalone: true,
  imports: [FormsModule, CollapsibleSectionCardComponent],
  template: `
    <app-collapsible-section-card title="Social links" [icon]="icon">
      @if (draft(); as d) {
        <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
          @for (field of fields; track field.key) {
            <div class="pf-editor-field">
              <span class="pf-editor-label">{{ field.label }}</span>
              <input class="pf-editor-input" [(ngModel)]="d.social[field.key]" (ngModelChange)="sync()" />
            </div>
          }
        </div>
      }
    </app-collapsible-section-card>
  `
})
export class SocialEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  readonly draft = this.state.draft;
  readonly icon = Share2;

  readonly fields = [
    { key: 'instagram' as const, label: 'Instagram' },
    { key: 'facebook' as const, label: 'Facebook' },
    { key: 'tiktok' as const, label: 'TikTok' },
    { key: 'whatsapp' as const, label: 'WhatsApp' },
    { key: 'website' as const, label: 'Website' },
    { key: 'youtube' as const, label: 'YouTube' }
  ];

  sync(): void {
    this.state.patchDraft((p) => ({ ...p }));
  }
}
