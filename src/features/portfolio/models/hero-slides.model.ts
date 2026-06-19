import { FileCategory } from '@shared/models/enums/file-category.enum';
import { UploadDocumentFile } from '@shared/files/upload-document.model';

export interface HeroSlideAttachment {
  fileCategory: FileCategory;
  files: UploadDocumentFile[];
}

export interface HeroSlideUpsertItem {
  id?: string;
  isDisplaySlideshow: boolean;
  eyebrow: string;
  headline: string;
  subHeadline: string;
  sortOrder: number;
  attachments?: HeroSlideAttachment[];
}

export interface HeroSlidesUpsertRequest {
  tenantId: string;
  slides: HeroSlideUpsertItem[];
}

export interface HeroSlideApiDto {
  id?: string;
  Id?: string;
  isDisplaySlideshow?: boolean;
  IsDisplaySlideshow?: boolean;
  eyebrow?: string | null;
  Eyebrow?: string | null;
  headline?: string | null;
  Headline?: string | null;
  subHeadline?: string | null;
  SubHeadline?: string | null;
  sortOrder?: number;
  SortOrder?: number;
  slideImageDocumentId?: string | null;
  SlideImageDocumentId?: string | null;
  slideImageDocumentUrl?: string | null;
  SlideImageDocumentUrl?: string | null;
  slideImageUrl?: string | null;
  SlideImageUrl?: string | null;
  imageUrl?: string | null;
  ImageUrl?: string | null;
}

/** GET /portfolio — heroSlides payload wrapper. */
export interface PortfolioHeroSlidesApiDto {
  tenantId?: string;
  TenantId?: string;
  slides?: HeroSlideApiDto[] | null;
  Slides?: HeroSlideApiDto[] | null;
}

export interface HeroSlideDto {
  id: string;
  isDisplaySlideshow: boolean;
  eyebrow: string;
  headline: string;
  subHeadline: string;
  sortOrder: number;
  imageUrl: string;
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

export function mapHeroSlideApiDto(dto: HeroSlideApiDto): HeroSlideDto | null {
  const id = pickString(dto.id, dto.Id);
  if (!id) {
    return null;
  }

  return {
    id,
    isDisplaySlideshow: dto.isDisplaySlideshow ?? dto.IsDisplaySlideshow ?? true,
    eyebrow: pickString(dto.eyebrow, dto.Eyebrow),
    headline: pickString(dto.headline, dto.Headline),
    subHeadline: pickString(dto.subHeadline, dto.SubHeadline),
    sortOrder: dto.sortOrder ?? dto.SortOrder ?? 0,
    imageUrl: pickString(
      dto.slideImageDocumentUrl,
      dto.SlideImageDocumentUrl,
      dto.slideImageUrl,
      dto.SlideImageUrl,
      dto.imageUrl,
      dto.ImageUrl
    )
  };
}

export function mapHeroSlidesApiList(
  slides: HeroSlideApiDto[] | null | undefined
): HeroSlideDto[] {
  if (!slides?.length) {
    return [];
  }
  return slides
    .map(mapHeroSlideApiDto)
    .filter((slide): slide is HeroSlideDto => slide !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function extractHeroSlidesFromApiPayload(
  payload: PortfolioHeroSlidesApiDto | HeroSlideApiDto[] | null | undefined
): HeroSlideDto[] {
  if (!payload) {
    return [];
  }
  if (Array.isArray(payload)) {
    return mapHeroSlidesApiList(payload);
  }
  return mapHeroSlidesApiList(payload.slides ?? payload.Slides);
}
