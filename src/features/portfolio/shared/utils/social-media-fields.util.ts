import {
  Facebook,
  Globe,
  Instagram,
  Link2,
  Linkedin,
  LucideIconData,
  Music2,
  Twitter,
  Youtube
} from 'lucide-angular';
import { SocialMediaType, SOCIAL_MEDIA_TYPE_LABELS } from '@shared/models/enums/social-media-type.enum';
import { PortfolioSocialLink } from '../../models/portfolio.model';

export interface SocialMediaFieldDef {
  type: SocialMediaType;
  label: string;
  placeholder: string;
  icon: LucideIconData;
}

const PLACEHOLDERS: Record<SocialMediaType, string> = {
  [SocialMediaType.Instagram]: 'https://instagram.com/...',
  [SocialMediaType.Facebook]: 'https://facebook.com/...',
  [SocialMediaType.TikTok]: 'https://tiktok.com/@...',
  [SocialMediaType.YouTube]: 'https://youtube.com/...',
  [SocialMediaType.LinkedIn]: 'https://linkedin.com/company/...',
  [SocialMediaType.Website]: 'https://yourwebsite.com',
  [SocialMediaType.Twitter]: 'https://x.com/...',
  [SocialMediaType.Other]: 'https://...'
};

export const SOCIAL_MEDIA_ICON_BY_TYPE: Record<SocialMediaType, LucideIconData> = {
  [SocialMediaType.Instagram]: Instagram,
  [SocialMediaType.Facebook]: Facebook,
  [SocialMediaType.TikTok]: Music2,
  [SocialMediaType.YouTube]: Youtube,
  [SocialMediaType.LinkedIn]: Linkedin,
  [SocialMediaType.Website]: Globe,
  [SocialMediaType.Twitter]: Twitter,
  [SocialMediaType.Other]: Link2
};

export const SOCIAL_MEDIA_FIELDS: SocialMediaFieldDef[] = (
  Object.values(SocialMediaType).filter((value) => typeof value === 'number') as SocialMediaType[]
).map((type) => ({
  type,
  label: SOCIAL_MEDIA_TYPE_LABELS[type],
  placeholder: PLACEHOLDERS[type],
  icon: SOCIAL_MEDIA_ICON_BY_TYPE[type]
}));

export function getSocialLinkUrl(links: PortfolioSocialLink[] | undefined, type: SocialMediaType): string {
  return links?.find((link) => link.type === type)?.url?.trim() ?? '';
}

export function upsertSocialLink(
  links: PortfolioSocialLink[],
  type: SocialMediaType,
  url: string
): PortfolioSocialLink[] {
  const trimmed = url.trim();
  const next = [...links];
  const index = next.findIndex((link) => link.type === type);

  if (!trimmed) {
    if (index >= 0) {
      next.splice(index, 1);
    }
    return next;
  }

  if (index >= 0) {
    next[index] = { ...next[index], url: trimmed };
    return next;
  }

  return [...next, { id: crypto.randomUUID(), type, url: trimmed }];
}
