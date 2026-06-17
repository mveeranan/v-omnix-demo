import { BusinessProfileDto } from '../../admin/models/business-profile.model';
import { mapUserDto, UserApiDto, UserDto } from '../../admin/models/user.model';
import { PortfolioDto } from './portfolio.dto';

export interface PortfolioBusinessProfileApiDto {
  id?: string;
  Id?: string;
  tenantId?: string;
  TenantId?: string;
  businessName?: string;
  BusinessName?: string;
  email?: string | null;
  Email?: string | null;
  phone?: string | null;
  Phone?: string | null;
  businessTypeId?: string;
  BusinessTypeId?: string;
  businessTypeName?: string | null;
  BusinessTypeName?: string | null;
  description?: string | null;
  Description?: string | null;
  logoDocumentId?: string | null;
  LogoDocumentId?: string | null;
  logoDocumentUrl?: string | null;
  LogoDocumentUrl?: string | null;
  coverImageDocumentId?: string | null;
  CoverImageDocumentId?: string | null;
  coverImageDocumentUrl?: string | null;
  CoverImageDocumentUrl?: string | null;
  storyDocumentId?: string | null;
  StoryDocumentId?: string | null;
  storyDocumentUrl?: string | null;
  StoryDocumentUrl?: string | null;
  presetId?: string | null;
  PresetId?: string | null;
  websiteUrl?: string | null;
  WebsiteUrl?: string | null;
  timeZone?: string | null;
  TimeZone?: string | null;
  currency?: string | null;
  Currency?: string | null;
}

export interface PortfolioApiDto {
  user?: UserApiDto | null;
  User?: UserApiDto | null;
  businessProfile?: PortfolioBusinessProfileApiDto | null;
  BusinessProfile?: PortfolioBusinessProfileApiDto | null;
  website?: PortfolioDto | null;
  Website?: PortfolioDto | null;
  portfolio?: PortfolioDto | null;
  Portfolio?: PortfolioDto | null;
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

function pickNullable(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (value === null) {
      return null;
    }
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return null;
}

export function mapPortfolioBusinessProfile(
  dto: PortfolioBusinessProfileApiDto | null | undefined
): BusinessProfileDto | null {
  if (!dto) {
    return null;
  }

  const businessName = pickString(dto.businessName, dto.BusinessName);
  const businessTypeId = pickString(dto.businessTypeId, dto.BusinessTypeId);
  if (!businessName && !businessTypeId) {
    return null;
  }

  return {
    id: pickString(dto.id, dto.Id) || undefined,
    tenantId: pickString(dto.tenantId, dto.TenantId) || undefined,
    businessName,
    email: pickNullable(dto.email, dto.Email),
    phone: pickNullable(dto.phone, dto.Phone),
    businessTypeId,
    description: pickNullable(dto.description, dto.Description),
    logoDocumentId: pickNullable(dto.logoDocumentId, dto.LogoDocumentId),
    coverImageDocumentId: pickNullable(
      dto.coverImageDocumentId,
      dto.CoverImageDocumentId,
      dto.storyDocumentId,
      dto.StoryDocumentId
    ),
    logoDocumentUrl: pickNullable(dto.logoDocumentUrl, dto.LogoDocumentUrl),
    coverImageDocumentUrl: pickNullable(
      dto.coverImageDocumentUrl,
      dto.CoverImageDocumentUrl,
      dto.storyDocumentUrl,
      dto.StoryDocumentUrl
    ),
    websiteUrl: pickNullable(dto.websiteUrl, dto.WebsiteUrl),
    timeZone: pickNullable(dto.timeZone, dto.TimeZone),
    currency: pickNullable(dto.currency, dto.Currency)
  };
}

export function extractUserFromPortfolio(dto: PortfolioApiDto | null | undefined): UserDto | null {
  if (!dto) {
    return null;
  }
  return mapUserDto(dto.user ?? dto.User);
}

export function extractBusinessProfileFromPortfolio(
  dto: PortfolioApiDto | null | undefined
): BusinessProfileDto | null {
  if (!dto) {
    return null;
  }
  return mapPortfolioBusinessProfile(dto.businessProfile ?? dto.BusinessProfile);
}

export function extractPresetIdFromPortfolio(
  dto: PortfolioApiDto | null | undefined
): string | null {
  const profile = dto?.businessProfile ?? dto?.BusinessProfile;
  if (!profile) {
    return null;
  }
  return pickNullable(profile.presetId, profile.PresetId);
}

export function extractPortfolioDraftFromApi(
  dto: PortfolioApiDto | null | undefined
): PortfolioDto | null {
  if (!dto) {
    return null;
  }
  return dto.website ?? dto.Website ?? dto.portfolio ?? dto.Portfolio ?? null;
}
