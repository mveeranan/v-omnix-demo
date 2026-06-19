import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Share2 } from 'lucide-angular';
import { SocialMediaType } from '@shared/models/enums/social-media-type.enum';
import { AdminDetailCardComponent } from '@features/admin/shared/admin-detail-card.component';
import { AdminDetailItemComponent } from '@features/admin/shared/admin-detail-item.component';
import { SectionToggleComponent } from '@features/portfolio/shared/ui/section-toggle.component';
import { WebsiteSectionShellComponent } from '@features/portfolio/editor/shared/website-section-shell.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import { WebsiteSectionStateService, SocialSectionBuffer } from '../../data-access/website-section-state.service';
import {
  SOCIAL_MEDIA_FIELDS,
  getSocialLinkUrl,
  upsertSocialLink
} from '../../shared/utils/social-media-fields.util';

@Component({
  selector: 'app-social-section',
  standalone: true,
  imports: [
    FormsModule,
    LucideAngularModule,
    WebsiteSectionShellComponent,
    SectionToggleComponent,
    AdminDetailCardComponent,
    AdminDetailItemComponent
  ],
  template: `
    <app-website-section-shell
      sectionId="social"
      title="Social Links"
      [icon]="icon"
      [complete]="hasAnyLink()"
    >
      <div view class="admin-detail-view admin-detail-view--rich">
        @if (filledFields().length) {
          <div class="admin-detail-view__grid admin-detail-view__grid--2">
            @for (field of filledFields(); track field.type) {
              <app-admin-detail-card>
                <app-admin-detail-item
                  [icon]="field.icon"
                  [label]="field.label"
                  [value]="linkUrl(field.type)"
                />
              </app-admin-detail-card>
            }
          </div>
        } @else {
          <p class="admin-detail-empty">No social links added yet.</p>
        }
      </div>

      <div edit class="pf-editor-fields">
        @if (buffer(); as b) {
          <app-section-toggle
            label="Show social links section"
            [enabled]="b.socialSection.enabled"
            (enabledChange)="patchSection({ enabled: $event })"
          />
          <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
            @for (field of fields; track field.type) {
              <div class="pf-editor-field">
                <span class="pf-editor-label pf-editor-label--with-icon">
                  <lucide-icon [img]="field.icon" class="h-4 w-4 shrink-0" />
                  {{ field.label }}
                </span>
                <input
                  class="pf-editor-input"
                  [ngModel]="linkUrl(field.type, b.social.links)"
                  (ngModelChange)="patchSocialUrl(field.type, $event)"
                  [placeholder]="field.placeholder"
                />
              </div>
            }
          </div>
        }
      </div>
    </app-website-section-shell>
  `,
  styles: `
    .pf-editor-label--with-icon {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }
  `
})
export class SocialSectionComponent {
  private readonly state = inject(PortfolioStateService);
  private readonly sectionState = inject(WebsiteSectionStateService);

  readonly draft = this.state.draft;
  readonly icon = Share2;
  readonly fields = SOCIAL_MEDIA_FIELDS;

  readonly buffer = computed(() => this.sectionState.buffer<SocialSectionBuffer>('social'));

  readonly filledFields = computed(() => {
    const links = this.draft()?.social.links ?? [];
    return this.fields.filter((field) => !!getSocialLinkUrl(links, field.type));
  });

  hasAnyLink(): boolean {
    return (this.draft()?.social.links ?? []).some((link) => !!link.url?.trim());
  }

  linkUrl(type: SocialMediaType, links = this.draft()?.social.links): string {
    return getSocialLinkUrl(links, type);
  }

  patchSection(partial: Partial<SocialSectionBuffer['socialSection']>): void {
    this.sectionState.patchBuffer<SocialSectionBuffer>('social', (b) => ({
      ...b,
      socialSection: { ...b.socialSection, ...partial }
    }));
  }

  patchSocialUrl(type: SocialMediaType, value: string): void {
    this.sectionState.patchBuffer<SocialSectionBuffer>('social', (b) => ({
      ...b,
      social: {
        links: upsertSocialLink(b.social.links ?? [], type, value)
      }
    }));
  }
}
