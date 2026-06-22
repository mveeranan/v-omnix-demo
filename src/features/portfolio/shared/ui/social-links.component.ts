import { Component, input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { SocialMediaType } from '@shared/models/enums/social-media-type.enum';
import { PortfolioSocial } from '../../models/portfolio.model';
import { SOCIAL_MEDIA_ICON_BY_TYPE } from '../../shared/utils/social-media-fields.util';
import { SOCIAL_MEDIA_TYPE_LABELS } from '@shared/models/enums/social-media-type.enum';

export interface SocialLinkItem {
  url: string;
  label: string;
  icon: LucideIconData;
  key: string;
}

@Component({
  selector: 'app-pf-social-links',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div class="pf-social-links" [class]="variant()">
      @for (link of links(); track link.key) {
        <a
          [href]="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="pf-social-link"
          [attr.aria-label]="link.label"
          [title]="link.label"
        >
          <lucide-icon [img]="link.icon" class="h-5 w-5" />
        </a>
      }
    </div>
  `,
  styles: `
    .pf-social-links {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
    }
    .pf-social-links--hero {
      gap: 1rem;
    }
    .pf-social-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--pf-accent-text, var(--pf-accent)) 45%, transparent);
      color: var(--pf-accent-text, var(--pf-accent));
      background: color-mix(in srgb, var(--pf-accent-text, var(--pf-accent)) 12%, transparent);
      transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
    }
    .pf-social-link:hover {
      transform: translateY(-2px);
      background: var(--pf-btn-bg, var(--pf-accent));
      color: var(--pf-btn-fg, var(--pf-on-accent, #fff));
    }
    .pf-social-links--footer .pf-social-link {
      color: var(--pf-text-muted);
      border-color: color-mix(in srgb, var(--pf-text-muted) 50%, transparent);
      background: transparent;
    }
    .pf-social-links--footer .pf-social-link:hover {
      color: var(--pf-accent-text, var(--pf-accent));
      background: color-mix(in srgb, var(--pf-accent-text, var(--pf-accent)) 15%, transparent);
      border-color: color-mix(in srgb, var(--pf-accent-text, var(--pf-accent)) 55%, transparent);
    }
  `
})
export class SocialLinksComponent {
  readonly social = input.required<PortfolioSocial>();
  /** hero | footer */
  readonly variant = input<'hero' | 'footer'>('footer');

  links(): SocialLinkItem[] {
    return (this.social().links ?? [])
      .filter((link) => !!link.url?.trim())
      .map((link) => ({
        key: `${link.type}-${link.id}`,
        url: link.url.trim(),
        label: SOCIAL_MEDIA_TYPE_LABELS[link.type] ?? 'Social link',
        icon: SOCIAL_MEDIA_ICON_BY_TYPE[link.type]
      }));
  }
}
