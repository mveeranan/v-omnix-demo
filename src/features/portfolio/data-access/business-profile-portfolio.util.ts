import { Portfolio } from '../models/portfolio.model';
import {
  BusinessProfileDto,
  getCoverPreviewUrl,
  getLogoPreviewUrl
} from '../../admin/models/business-profile.model';

/** Merge live business profile into portfolio draft (brand + story + contact). */
export function mergeBusinessProfileIntoPortfolio(
  portfolio: Portfolio,
  profile: BusinessProfileDto
): Portfolio {
  const logoUrl = getLogoPreviewUrl(profile) || portfolio.brand.logoUrl;
  const storyImageUrl =
    getCoverPreviewUrl(profile) ||
    portfolio.storeDescription.imageUrl ||
    portfolio.brand.coverImageUrl ||
    '';
  const description = profile.description?.trim() || portfolio.storeDescription.description;

  return {
    ...portfolio,
    brand: {
      ...portfolio.brand,
      businessName: profile.businessName?.trim() || portfolio.brand.businessName,
      logoUrl,
      coverImageUrl: storyImageUrl || portfolio.brand.coverImageUrl
    },
    storeDescription: {
      ...portfolio.storeDescription,
      description,
      imageUrl: storyImageUrl
    },
    about: {
      ...portfolio.about,
      description
    },
    contact: {
      ...portfolio.contact,
      enabled: portfolio.contact.enabled,
      email: profile.email?.trim() || portfolio.contact.email,
      phone: profile.phone?.trim() || portfolio.contact.phone
    }
  };
}

/** Apply business profile API response URLs back onto a portfolio partial after upsert. */
export function applyBusinessProfileToPortfolioPartial(
  partial: Partial<Portfolio>,
  profile: BusinessProfileDto
): Partial<Portfolio> {
  const logoUrl = getLogoPreviewUrl(profile);
  const coverUrl = getCoverPreviewUrl(profile);

  return {
    ...partial,
    brand: partial.brand
      ? {
          ...partial.brand,
          businessName: profile.businessName?.trim() || partial.brand.businessName,
          logoUrl: logoUrl || partial.brand.logoUrl,
          coverImageUrl: coverUrl || partial.brand.coverImageUrl
        }
      : partial.brand,
    storeDescription: partial.storeDescription
      ? {
          ...partial.storeDescription,
          description: profile.description?.trim() || partial.storeDescription.description,
          imageUrl: coverUrl || partial.storeDescription.imageUrl
        }
      : partial.storeDescription,
    about: partial.about
      ? {
          ...partial.about,
          description: profile.description?.trim() || partial.about.description
        }
      : partial.about
  };
}
