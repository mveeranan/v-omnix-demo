import { Component, input } from '@angular/core';
import {
  LucideAngularModule,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  Music2,
  Phone
} from 'lucide-angular';
import { PortfolioSocial } from '../../models/portfolio.model';

export interface SocialLinkItem {
  url: string;
  label: string;
  icon: typeof Instagram;
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
      border: 1px solid color-mix(in srgb, var(--pf-accent) 45%, transparent);
      color: var(--pf-accent);
      background: color-mix(in srgb, var(--pf-accent) 12%, transparent);
      transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
    }
    .pf-social-link:hover {
      transform: translateY(-2px);
      background: var(--pf-accent);
      color: var(--pf-on-accent);
    }
    .pf-social-links--footer .pf-social-link {
      color: var(--pf-text-muted);
      border-color: color-mix(in srgb, var(--pf-text-muted) 50%, transparent);
      background: transparent;
    }
    .pf-social-links--footer .pf-social-link:hover {
      color: var(--pf-accent);
      background: color-mix(in srgb, var(--pf-accent) 15%, transparent);
      border-color: var(--pf-accent);
    }
  `
})
export class SocialLinksComponent {
  readonly social = input.required<PortfolioSocial>();
  /** hero | footer */
  readonly variant = input<'hero' | 'footer'>('footer');

  links(): SocialLinkItem[] {
    const s = this.social();
    const items: SocialLinkItem[] = [];
    if (s.instagram?.trim()) {
      items.push({ key: 'instagram', url: s.instagram, label: 'Instagram', icon: Instagram });
    }
    if (s.facebook?.trim()) {
      items.push({ key: 'facebook', url: s.facebook, label: 'Facebook', icon: Facebook });
    }
    if (s.tiktok?.trim()) {
      items.push({ key: 'tiktok', url: s.tiktok, label: 'TikTok', icon: Music2 });
    }
    if (s.youtube?.trim()) {
      items.push({ key: 'youtube', url: s.youtube, label: 'YouTube', icon: Youtube });
    }
    if (s.website?.trim()) {
      items.push({ key: 'website', url: s.website, label: 'Website', icon: Globe });
    }
    if (s.whatsapp?.trim()) {
      const phone = s.whatsapp.replace(/\D/g, '');
      if (phone) {
        items.push({
          key: 'whatsapp',
          url: `https://wa.me/${phone}`,
          label: 'WhatsApp',
          icon: Phone
        });
      }
    }
    return items;
  }
}
