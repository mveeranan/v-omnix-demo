import { SocialMediaType } from '@shared/models/enums/social-media-type.enum';
import { Portfolio, PortfolioSocial, PortfolioSocialLink } from '../models/portfolio.model';
import { PortfolioSocialDto } from '../models/dto/portfolio.dto';
import {
  SocialMediaDto,
  SocialMediaUpsertRequest,
  mapSocialMediaLinksToPortfolioLinks
} from '../models/social-media.model';
import { getSocialLinkUrl } from '../shared/utils/social-media-fields.util';

export function mergeSocialMediaIntoPortfolio(
  portfolio: Portfolio,
  socialMedia: SocialMediaDto | null | undefined
): Portfolio {
  if (!socialMedia?.links?.length) {
    return portfolio;
  }

  return {
    ...portfolio,
    social: {
      links: mapSocialMediaLinksToPortfolioLinks(socialMedia.links)
    }
  };
}

export function mapLegacySocialDtoToLinks(dto: PortfolioSocialDto | undefined): PortfolioSocialLink[] {
  if (!dto) {
    return [];
  }

  const entries: Array<[SocialMediaType, string | undefined]> = [
    [SocialMediaType.Instagram, dto.instagram],
    [SocialMediaType.Facebook, dto.facebook],
    [SocialMediaType.TikTok, dto.tiktok],
    [SocialMediaType.YouTube, dto.youtube],
    [SocialMediaType.Website, dto.website]
  ];

  const links: PortfolioSocialLink[] = [];
  for (const [type, url] of entries) {
    const trimmed = url?.trim();
    if (trimmed) {
      links.push({ id: `legacy-${type}`, type, url: trimmed });
    }
  }
  return links;
}

export function resolvePortfolioSocialLinks(
  socialMedia: SocialMediaDto | null | undefined,
  legacySocial: PortfolioSocialDto | undefined,
  existing: PortfolioSocial | undefined
): PortfolioSocial {
  if (socialMedia?.links?.length) {
    return { links: mapSocialMediaLinksToPortfolioLinks(socialMedia.links) };
  }

  const legacyLinks = mapLegacySocialDtoToLinks(legacySocial);
  if (legacyLinks.length) {
    return { links: legacyLinks };
  }

  if (existing?.links?.length) {
    return { links: existing.links.map((link) => ({ ...link })) };
  }

  return { links: [] };
}

export function buildSocialMediaUpsertRequest(
  tenantId: string,
  social: PortfolioSocial
): SocialMediaUpsertRequest {
  return {
    tenantId,
    links: (social.links ?? [])
      .filter((link) => link.url?.trim())
      .map((link) => {
        const persistedId = link.persistedId?.trim();
        return {
          ...(persistedId ? { id: persistedId } : {}),
          type: link.type,
          url: link.url.trim()
        };
      })
  };
}

export function mapPortfolioLinksToLegacySocialDto(links: PortfolioSocialLink[]): PortfolioSocialDto {
  return {
    instagram: getSocialLinkUrl(links, SocialMediaType.Instagram),
    facebook: getSocialLinkUrl(links, SocialMediaType.Facebook),
    tiktok: getSocialLinkUrl(links, SocialMediaType.TikTok),
    whatsapp: '',
    website: getSocialLinkUrl(links, SocialMediaType.Website),
    youtube: getSocialLinkUrl(links, SocialMediaType.YouTube)
  };
}
