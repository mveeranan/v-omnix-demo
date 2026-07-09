import { Portfolio, PortfolioHero, PortfolioHeroSlide } from '../models/portfolio.model';
import { HeroSlideDto, HeroSlidesUpsertRequest } from '../models/hero-slides.model';
import { FileCategory } from '@shared/files/file-category.enum';
import {
  buildAttachmentFromDataUrl,
  buildUploadDocumentRequest,
  isDataUrl
} from '@shared/files/upload-document.model';

export interface HeroSlidePendingUploads {
  slideFiles: Record<string, File>;
}

export function mergeHeroSlidesIntoPortfolio(
  portfolio: Portfolio,
  slides: HeroSlideDto[],
  options?: { force?: boolean }
): Portfolio {
  if (!slides.length && !options?.force) {
    return portfolio;
  }

  const existingById = indexSlidesById(portfolio.hero.slides ?? []);
  const mappedSlides = slides.map((slide) =>
    mapHeroSlideDtoToPortfolioSlide(slide, existingById.get(slide.id))
  );

  const first = slides[0];
  const enabled = slides.some((slide) => slide.isDisplaySlideshow);

  return {
    ...portfolio,
    hero: {
      ...portfolio.hero,
      enabled,
      eyebrow: first?.eyebrow || portfolio.hero.eyebrow,
      headline: first?.headline || portfolio.hero.headline,
      subheadline: first?.subHeadline || portfolio.hero.subheadline,
      slides: mappedSlides
    }
  };
}

function indexSlidesById(slides: PortfolioHeroSlide[]): Map<string, PortfolioHeroSlide> {
  const map = new Map<string, PortfolioHeroSlide>();
  for (const slide of slides) {
    map.set(slide.id, slide);
    if (slide.persistedId) {
      map.set(slide.persistedId, slide);
    }
  }
  return map;
}

export function applyHeroSlidesToPortfolioPartial(
  partial: Partial<Portfolio>,
  slides: HeroSlideDto[],
  heroBuffer: PortfolioHero
): Partial<Portfolio> {
  const existingById = new Map((heroBuffer.slides ?? []).map((slide) => [slide.id, slide]));
  const mappedSlides = slides.length
    ? slides.map((slide) => mapHeroSlideDtoToPortfolioSlide(slide, existingById.get(slide.id)))
    : heroBuffer.slides ?? [];

  return {
    ...partial,
    hero: {
      ...heroBuffer,
      enabled: slides.length ? slides.some((slide) => slide.isDisplaySlideshow) : heroBuffer.enabled,
      eyebrow: slides[0]?.eyebrow || heroBuffer.eyebrow,
      slides: mappedSlides
    }
  };
}

function mapHeroSlideDtoToPortfolioSlide(
  dto: HeroSlideDto,
  existing?: PortfolioHeroSlide
): PortfolioHeroSlide {
  return {
    id: dto.id,
    persistedId: dto.id,
    sortOrder: dto.sortOrder,
    imageUrl: dto.imageUrl || existing?.imageUrl || '',
    imageDocumentId: dto.imageDocumentId || existing?.imageDocumentId,
    headline: dto.headline || existing?.headline || '',
    subheadline: dto.subHeadline || existing?.subheadline || '',
    ctaLabel: existing?.ctaLabel || '',
    ctaTarget: existing?.ctaTarget || ''
  };
}

export async function buildHeroSlidesUpsertRequest(
  tenantId: string,
  hero: PortfolioHero,
  pending: HeroSlidePendingUploads
): Promise<HeroSlidesUpsertRequest> {
  const slides = hero.slides ?? [];

  return {
    tenantId,
    slides: await Promise.all(
      slides.map(async (slide, index) => {
        const attachments = await buildSlideAttachments(slide, pending.slideFiles[slide.id] ?? null);
        const persistedId = slide.persistedId?.trim();
        return {
          ...(persistedId ? { id: persistedId } : {}),
          isDisplaySlideshow: hero.enabled,
          eyebrow: hero.eyebrow?.trim() || '',
          headline: slide.headline?.trim() || '',
          subHeadline: slide.subheadline?.trim() || '',
          sortOrder: index,
          ...(attachments?.length ? { attachments } : {})
        };
      })
    )
  };
}

async function buildSlideAttachments(
  slide: PortfolioHeroSlide,
  file: File | null
): Promise<Array<{ fileCategory: FileCategory; files: { fileName: string; contentType: string; base64Content: string }[] }> | undefined> {
  if (file) {
    const attachment = await buildUploadDocumentRequest(file, FileCategory.HeroSlide);
    return [{ fileCategory: attachment.fileCategory, files: attachment.files }];
  }

  if (isDataUrl(slide.imageUrl)) {
    const attachment = buildAttachmentFromDataUrl(
      slide.imageUrl,
      `hero-slide-${slide.id}.png`,
      FileCategory.HeroSlide
    );
    if (!attachment) {
      return undefined;
    }
    return [{ fileCategory: attachment.fileCategory, files: attachment.files }];
  }

  return undefined;
}
