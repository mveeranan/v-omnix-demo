import { SocialMediaType } from '@shared/models/enums/social-media-type.enum';
import { PortfolioSocialLink } from './portfolio.model';

export interface SocialMediaLinkApiDto {
  id?: string;
  Id?: string;
  type?: number;
  Type?: number;
  url?: string | null;
  Url?: string | null;
}

export interface PortfolioSocialMediaApiDto {
  tenantId?: string;
  TenantId?: string;
  links?: SocialMediaLinkApiDto[] | null;
  Links?: SocialMediaLinkApiDto[] | null;
}

export interface SocialMediaLinkDto {
  id: string;
  type: SocialMediaType;
  url: string;
}

export interface SocialMediaDto {
  tenantId: string;
  links: SocialMediaLinkDto[];
}

export interface SocialMediaUpsertRequest {
  tenantId: string;
  links: Array<{
    id?: string;
    type: SocialMediaType;
    url: string;
  }>;
}

function pickString(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return '';
}

function normalizeSocialMediaType(value: number | null | undefined): SocialMediaType | null {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }
  const values = Object.values(SocialMediaType).filter((entry) => typeof entry === 'number') as number[];
  return values.includes(value) ? (value as SocialMediaType) : null;
}

export function mapSocialMediaLinkApiDto(dto: SocialMediaLinkApiDto): SocialMediaLinkDto | null {
  const id = pickString(dto.id, dto.Id);
  const type = normalizeSocialMediaType(dto.type ?? dto.Type);
  const url = pickString(dto.url, dto.Url);
  if (!id || type == null) {
    return null;
  }
  return { id, type, url };
}

export function mapSocialMediaLinksApiList(
  links: SocialMediaLinkApiDto[] | null | undefined
): SocialMediaLinkDto[] {
  if (!links?.length) {
    return [];
  }
  return links
    .map(mapSocialMediaLinkApiDto)
    .filter((link): link is SocialMediaLinkDto => link !== null)
    .sort((a, b) => a.type - b.type);
}

export function mapSocialMediaApiDto(
  dto: PortfolioSocialMediaApiDto | null | undefined,
  tenantIdFallback = ''
): SocialMediaDto | null {
  if (!dto) {
    return null;
  }
  const tenantId = pickString(dto.tenantId, dto.TenantId, tenantIdFallback);
  if (!tenantId) {
    return null;
  }
  return {
    tenantId,
    links: mapSocialMediaLinksApiList(dto.links ?? dto.Links)
  };
}

export function extractSocialMediaFromPortfolioApi(
  payload: PortfolioSocialMediaApiDto | null | undefined,
  tenantIdFallback = ''
): SocialMediaDto | null {
  return mapSocialMediaApiDto(payload, tenantIdFallback);
}

export function mapSocialMediaLinksToPortfolioLinks(links: SocialMediaLinkDto[]): PortfolioSocialLink[] {
  return links.map((link) => ({
    id: link.id,
    persistedId: link.id,
    type: link.type,
    url: link.url
  }));
}
