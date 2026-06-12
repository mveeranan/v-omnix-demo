import { Mapper } from '../../../shared/mappers/mapper';
import { PortfolioDto, PortfolioHighlightsDto } from '../models/portfolio.dto';
import { Portfolio, PortfolioHighlightItem, createEmptyPortfolio } from '../models/portfolio.model';

const defaults = createEmptyPortfolio();

function normalizeHighlightItems(
  items: PortfolioHighlightsDto['items'] | undefined
): PortfolioHighlightItem[] {
  if (!items?.length) return [];
  return items.map((item) => {
    if (typeof item === 'string') {
      return { text: item, iconId: 'sparkles' };
    }
    return { text: item.text, iconId: item.iconId || 'sparkles' };
  });
}

function syncLegacyFields(portfolio: Portfolio): Portfolio {
  return {
    ...portfolio,
    about: {
      ...portfolio.about,
      enabled: portfolio.storeDescription.enabled,
      description: portfolio.storeDescription.description
    },
    contact: {
      ...portfolio.contact,
      enabled: portfolio.contactSupport.enabled,
      email: portfolio.contactSupport.email,
      phone: portfolio.contactSupport.phone
    },
    hero: {
      ...portfolio.hero,
      headline: portfolio.hero.headline || portfolio.brand.businessName,
      subheadline: portfolio.hero.subheadline || portfolio.brand.tagline
    }
  };
}

export class PortfolioMapper implements Mapper<PortfolioDto, Portfolio> {
  map(source: PortfolioDto): Portfolio {
    const storeDescription = source.storeDescription ?? {
      enabled: source.about?.enabled ?? true,
      description: source.about?.description ?? ''
    };

    const contactSupport = source.contactSupport ?? {
      enabled: source.contact?.enabled ?? true,
      phone: source.contact?.phone ?? '',
      email: source.contact?.email ?? '',
      supportHours: ''
    };

    const brand = {
      enabled: source.brand.enabled ?? true,
      logoUrl: source.brand.logoUrl,
      businessName: source.brand.businessName,
      tagline: source.brand.tagline,
      coverImageUrl: source.brand.coverImageUrl
    };

    const portfolio: Portfolio = {
      id: source.id,
      slug: source.slug,
      published: source.published,
      updatedAt: source.updatedAt,
      brand,
      hero: source.hero
        ? {
            ...defaults.hero,
            ...source.hero,
            eyebrow: source.hero.eyebrow ?? defaults.hero.eyebrow
          }
        : {
            ...defaults.hero,
            headline: brand.businessName || defaults.hero.headline,
            subheadline: brand.tagline
          },
      offerBanner: source.offerBanner
        ? { ...source.offerBanner, productIds: [...source.offerBanner.productIds] }
        : { ...defaults.offerBanner },
      saleCollection: source.saleCollection
        ? { ...source.saleCollection, productIds: [...source.saleCollection.productIds] }
        : { ...defaults.saleCollection },
      storeDescription: { ...storeDescription },
      gallerySection: source.gallerySection ?? { enabled: true },
      gallery: source.gallery.map((g) => ({ ...g })),
      featuredProducts: source.featuredProducts
        ? {
            ...defaults.featuredProducts,
            ...source.featuredProducts,
            productIds: [...source.featuredProducts.productIds],
            promoMarqueeText:
              source.featuredProducts.promoMarqueeText ?? defaults.featuredProducts.promoMarqueeText,
            showQtyControls:
              source.featuredProducts.showQtyControls ?? defaults.featuredProducts.showQtyControls
          }
        : { ...defaults.featuredProducts },
      reviewsSection: source.reviewsSection ?? { enabled: true },
      reviews: source.reviews.map((r) => ({ ...r })),
      contactSupport: { ...contactSupport },
      paymentMethods: source.paymentMethods ? { ...source.paymentMethods } : { ...defaults.paymentMethods },
      storePolicies: source.storePolicies ? { ...source.storePolicies } : { ...defaults.storePolicies },
      trustBadges: source.trustBadges ? { ...source.trustBadges } : { ...defaults.trustBadges },
      newsletter: source.newsletter ? { ...source.newsletter } : { ...defaults.newsletter },
      socialSection: source.socialSection ?? { enabled: true },
      social: {
        instagram: source.social.instagram,
        facebook: source.social.facebook,
        tiktok: source.social.tiktok,
        whatsapp: source.social.whatsapp,
        youtube: source.social.youtube
      },
      about: {
        ...source.about,
        achievements: [...source.about.achievements],
        certifications: [...source.about.certifications]
      },
      services: source.services.map((s) => ({ ...s })),
      team: {
        enabled: source.team.enabled,
        members: source.team.members.map((m) => ({ ...m }))
      },
      stats: {
        ...defaults.stats,
        ...source.stats,
        totalOrders:
          source.stats.totalOrders ??
          source.stats.ordersCompleted ??
          source.stats.bookingsCompleted ??
          0,
        totalCustomers: source.stats.totalCustomers ?? source.stats.happyCustomers ?? 0
      },
      cta: { ...source.cta },
      contact: source.contact ? { ...source.contact } : { ...defaults.contact },
      highlights: source.highlights
        ? {
            enabled: source.highlights.enabled,
            title: source.highlights.title,
            items: normalizeHighlightItems(source.highlights.items)
          }
        : { ...defaults.highlights },
      theme: { ...source.theme }
    };

    return syncLegacyFields(portfolio);
  }

  toDto(portfolio: Portfolio): PortfolioDto {
    const synced = syncLegacyFields(portfolio);
    return {
      id: synced.id,
      slug: synced.slug,
      published: synced.published,
      updatedAt: synced.updatedAt,
      brand: { ...synced.brand },
      hero: { ...synced.hero },
      offerBanner: { ...synced.offerBanner, productIds: [...synced.offerBanner.productIds] },
      saleCollection: {
        ...synced.saleCollection,
        productIds: [...synced.saleCollection.productIds]
      },
      storeDescription: { ...synced.storeDescription },
      gallerySection: { ...synced.gallerySection },
      featuredProducts: {
        ...synced.featuredProducts,
        productIds: [...synced.featuredProducts.productIds]
      },
      reviewsSection: { ...synced.reviewsSection },
      contactSupport: { ...synced.contactSupport },
      paymentMethods: { ...synced.paymentMethods },
      storePolicies: { ...synced.storePolicies },
      trustBadges: { ...synced.trustBadges },
      newsletter: { ...synced.newsletter },
      socialSection: { ...synced.socialSection },
      about: {
        ...synced.about,
        achievements: [...synced.about.achievements],
        certifications: [...synced.about.certifications]
      },
      services: synced.services.map((s) => ({ ...s })),
      gallery: synced.gallery.map((g) => ({ ...g })),
      reviews: synced.reviews.map((r) => ({ ...r })),
      social: { ...synced.social },
      team: {
        enabled: synced.team.enabled,
        members: synced.team.members.map((m) => ({ ...m }))
      },
      stats: { ...synced.stats },
      cta: { ...synced.cta },
      contact: { ...synced.contact },
      highlights: {
        ...synced.highlights,
        items: synced.highlights.items.map((i) => ({ ...i }))
      },
      theme: { ...synced.theme }
    };
  }
}
