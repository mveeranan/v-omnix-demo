import { WebsiteSectionType } from '../../../shared/models/backend-enums';

/** Maps portfolio editor sections to backend WebsiteSection contentJson shapes. */
export interface WebsiteSectionContentJson {
  sectionType: WebsiteSectionType;
  title?: string;
  subtitle?: string;
  enabled?: boolean;
  content: Record<string, unknown>;
}

export function portfolioSectionToContentJson(
  sectionId: string,
  portfolioSlice: Record<string, unknown>
): WebsiteSectionContentJson {
  const typeMap: Record<string, WebsiteSectionType> = {
    hero: 'Hero',
    featuredProducts: 'FeaturedProducts',
    categoryShowcase: 'FeaturedCategories',
    storeDescription: 'StoreDescription',
    reviews: 'Testimonials',
    whyChooseUs: 'WhyChooseUs',
    contactSupport: 'ContactSupport',
    newsletter: 'NewsletterSignup',
    lookbook: 'PortfolioGallery',
    promoStrip: 'PromoBanner'
  };
  return {
    sectionType: typeMap[sectionId] ?? 'RichText',
    enabled: true,
    content: portfolioSlice
  };
}
