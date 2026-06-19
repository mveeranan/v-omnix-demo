import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Share2 } from 'lucide-angular';
import { SocialMediaType } from '@shared/models/enums/social-media-type.enum';
import { CollapsibleSectionCardComponent } from '@features/portfolio/shared/ui/collapsible-section-card.component';
import { PortfolioStateService } from '../../data-access/portfolio-state.service';
import {
  SOCIAL_MEDIA_FIELDS,
  getSocialLinkUrl,
  upsertSocialLink
} from '../../shared/utils/social-media-fields.util';

@Component({
  selector: 'app-social-editor-section',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, CollapsibleSectionCardComponent],
  template: `
    <app-collapsible-section-card title="Social links" [icon]="icon">
      @if (draft(); as d) {
        <div class="pf-editor-fields-grid pf-editor-fields-grid--2">
          @for (field of fields; track field.type) {
            <div class="pf-editor-field">
              <span class="pf-editor-label pf-editor-label--with-icon">
                <lucide-icon [img]="field.icon" class="h-4 w-4 shrink-0" />
                {{ field.label }}
              </span>
              <input
                class="pf-editor-input"
                [ngModel]="linkUrl(field.type, d.social.links)"
                (ngModelChange)="updateLink(field.type, $event)"
              />
            </div>
          }
        </div>
      }
    </app-collapsible-section-card>
  `,
  styles: `
    .pf-editor-label--with-icon {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }
  `
})
export class SocialEditorSectionComponent {
  private readonly state = inject(PortfolioStateService);
  readonly draft = this.state.draft;
  readonly icon = Share2;
  readonly fields = SOCIAL_MEDIA_FIELDS;

  linkUrl(type: SocialMediaType, links = this.draft()?.social.links): string {
    return getSocialLinkUrl(links, type);
  }

  updateLink(type: SocialMediaType, value: string): void {
    const current = this.draft();
    if (!current) {
      return;
    }
    this.state.applyDraftPartial({
      social: {
        links: upsertSocialLink(current.social.links ?? [], type, value)
      }
    });
  }
}
