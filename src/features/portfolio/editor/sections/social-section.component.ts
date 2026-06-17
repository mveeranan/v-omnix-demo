import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Share2 } from 'lucide-angular';
import { AdminDetailFieldComponent } from '../../../admin/shared/admin-detail-field.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService, SocialSectionBuffer } from '../../data-access/website-section-state.service';

@Component({
  selector: 'app-social-section',
  standalone: true,
  imports: [FormsModule, WebsiteSectionShellComponent, SectionToggleComponent, AdminDetailFieldComponent],
  template: `
    <app-website-section-shell
      sectionId="social"
      title="Social Links"
      [icon]="icon"
      [complete]="hasAnyLink()"
    >
      <div view class="admin-detail-view">
        <div class="admin-detail-view__grid admin-detail-view__grid--2">
          @for (field of fields; track field.key) {
            <app-admin-detail-field [label]="field.label" [value]="draft()?.social?.[field.key]" />
          }
        </div>
      </div>

      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle
            label="Show social links section"
            [enabled]="b.socialSection.enabled"
            (enabledChange)="patchSection({ enabled: $event })"
          />
          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            @for (field of fields; track field.key) {
              <div class="pf-editor-field">
                <span class="pf-editor-label">{{ field.label }}</span>
                <input
                  class="pf-editor-input"
                  [ngModel]="b.social[field.key]"
                  (ngModelChange)="patchSocialField(field.key, $event)"
                  [placeholder]="field.placeholder"
                />
              </div>
            }
          </div>
        }
      </div>
    </app-website-section-shell>
  `
})
export class SocialSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = Share2;

  readonly fields = [
    { key: 'instagram' as const, label: 'Instagram', placeholder: 'https://instagram.com/...' },
    { key: 'facebook' as const, label: 'Facebook', placeholder: 'https://facebook.com/...' },
    { key: 'whatsapp' as const, label: 'WhatsApp', placeholder: 'https://wa.me/...' },
    { key: 'youtube' as const, label: 'YouTube', placeholder: 'https://youtube.com/...' },
    { key: 'tiktok' as const, label: 'TikTok', placeholder: 'https://tiktok.com/...' }
  ];

  readonly buffer = computed(() => this.sectionState.buffer<SocialSectionBuffer>('social'));

  hasAnyLink(): boolean {
    const s = this.draft()?.social;
    if (!s) return false;
    return Object.values(s).some((v) => !!v?.trim());
  }

  patchSection(partial: Partial<SocialSectionBuffer['socialSection']>): void {
    this.sectionState.patchBuffer<SocialSectionBuffer>('social', (b) => ({
      ...b,
      socialSection: { ...b.socialSection, ...partial }
    }));
  }

  patchSocialField(key: keyof SocialSectionBuffer['social'], value: string): void {
    this.sectionState.patchBuffer<SocialSectionBuffer>('social', (b) => ({
      ...b,
      social: { ...b.social, [key]: value }
    }));
  }
}
