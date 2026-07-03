import { Mapper } from '@shared/mappers/mapper';
import { PortfolioDto, PortfolioHighlightsDto } from '../models/dto/portfolio.dto';
import { Portfolio, PortfolioHighlightItem, PortfolioTeamMember, createEmptyPortfolio } from '../models/portfolio.model';
import { mergeWithWebsiteDefaults } from '../models/portfolio-defaults';
import { normalizePortfolioTheme } from '../models/theme-preset.model';
import { mapLegacySocialDtoToLinks, mapPortfolioLinksToLegacySocialDto } from './social-media-portfolio.util';

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
    const storeDescription = {
      enabled: source.storeDescription?.enabled ?? source.about?.enabled ?? true,
      description: source.storeDescription?.description ?? source.about?.description ?? '',
      imageUrl:
        source.storeDescription?.imageUrl?.trim() ||
        source.brand?.coverImageUrl?.trim() ||
        ''
    };

    const contactSupport = source.contactSupport ?? {
      enabled: source.contact?.enabled ?? true,
      phone: source.contact?.phone ?? '',
      email: source.contact?.email ?? '',
      supportHours: ''
    };

    const brandSource = source.brand ?? defaults.brand;
    const brand = {
      enabled: brandSource.enabled ?? true,
      logoUrl: brandSource.logoUrl ?? '',
      businessName: brandSource.businessName ?? '',
      tagline: brandSource.tagline ?? '',
      coverImageUrl: brandSource.coverImageUrl ?? ''
    };

    const portfolio: Portfolio = {
      id: source.id,
      slug: source.slug,
      published: source.published,
      updatedAt: source.updatedAt,
      announcementBar: source.announcementBar
        ? { ...defaults.announcementBar, ...source.announcementBar }
        : { ...defaults.announcementBar },
      faq: source.faq
        ? {
            ...defaults.faq,
            ...source.faq,
            items: (source.faq.items ?? []).map((i: { id?: string; question: string; answer: string; order?: number }) => ({
              id: i.id ?? crypto.randomUUID(),
              question: i.question,
              answer: i.answer,
              order: i.order ?? 0
            }))
          }
        : { ...defaults.faq },
      newArrivals: source.newArrivals
        ? { ...defaults.newArrivals, ...source.newArrivals }
        : { ...defaults.newArrivals },
      brandStrip: source.brandStrip
        ? {
            ...defaults.brandStrip,
            ...source.brandStrip,
            logos: (source.brandStrip.logos ?? []).map((l: { id?: string; name: string; logoUrl: string; order?: number }) => ({
              id: l.id ?? crypto.randomUUID(),
              name: l.name,
              logoUrl: l.logoUrl,
              order: l.order ?? 0
            }))
          }
        : { ...defaults.brandStrip },
      brand,
      hero: source.hero
        ? {
            ...defaults.hero,
            ...source.hero,
            eyebrow: source.hero.eyebrow ?? defaults.hero.eyebrow,
            slides: (source.hero.slides ?? []).map((s) => ({ ...s }))
          }
        : {
            ...defaults.hero,
            headline: brand.businessName || defaults.hero.headline,
            subheadline: brand.tagline
          },
      categoryShowcase: source.categoryShowcase
        ? {
            ...defaults.categoryShowcase,
            ...source.categoryShowcase,
            categoryNames: [...source.categoryShowcase.categoryNames]
          }
        : { ...defaults.categoryShowcase },
      lookbook: source.lookbook ? { ...defaults.lookbook, ...source.lookbook } : { ...defaults.lookbook },
      promoStrip: source.promoStrip ? { ...defaults.promoStrip, ...source.promoStrip } : { ...defaults.promoStrip },
      offerBanner: source.offerBanner
        ? { ...source.offerBanner, productIds: [...source.offerBanner.productIds] }
        : { ...defaults.offerBanner },
      saleCollection: source.saleCollection
        ? { ...source.saleCollection, productIds: [...source.saleCollection.productIds] }
        : { ...defaults.saleCollection },
      storeDescription: { ...storeDescription },
      gallerySection: source.gallerySection ?? { enabled: true },
      gallery: (source.gallery ?? []).map((g) => ({ ...g })),
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
      reviews: (source.reviews ?? []).map((r) => ({ ...r })),
      contactSupport: { ...contactSupport },
      paymentMethods: source.paymentMethods ? { ...source.paymentMethods } : { ...defaults.paymentMethods },
      storePolicies: source.storePolicies ? { ...source.storePolicies } : { ...defaults.storePolicies },
      trustBadges: source.trustBadges ? { ...source.trustBadges } : { ...defaults.trustBadges },
      newsletter: source.newsletter ? { ...source.newsletter } : { ...defaults.newsletter },
      socialSection: source.socialSection ?? { enabled: true },
      social: {
        links: mapLegacySocialDtoToLinks(source.social)
      },
      about: {
        ...defaults.about,
        ...source.about,
        achievements: [...(source.about?.achievements ?? [])],
        certifications: [...(source.about?.certifications ?? [])]
      },
      services: (source.services ?? []).map((s) => ({ ...s })),
      team: {
        enabled: source.team?.enabled ?? defaults.team.enabled,
        members: (source.team?.members ?? []).map((m: PortfolioTeamMember) => ({ ...m }))
      },
      stats: source.stats
        ? {
            enabled: source.stats.enabled ?? true,
            yearsExperience: source.stats.yearsExperience ?? defaults.stats.yearsExperience,
            happyCustomers: source.stats.happyCustomers ?? defaults.stats.happyCustomers,
            totalOrders:
              source.stats.totalOrders ??
              source.stats.ordersCompleted ??
              source.stats.bookingsCompleted ??
              defaults.stats.totalOrders,
            totalCustomers:
              source.stats.totalCustomers ??
              source.stats.happyCustomers ??
              defaults.stats.totalCustomers,
            totalProducts: source.stats.totalProducts ?? defaults.stats.totalProducts
          }
        : { ...defaults.stats },
      cta: { ...defaults.cta, ...source.cta },
      contact: source.contact ? { ...source.contact } : { ...defaults.contact },
      highlights: source.highlights
        ? {
            enabled: source.highlights.enabled,
            title: source.highlights.title,
            items: normalizeHighlightItems(source.highlights.items)
          }
        : { ...defaults.highlights },
      theme: normalizePortfolioTheme(source.theme)
    };

    return mergeWithWebsiteDefaults(syncLegacyFields(portfolio));
  }

  toDto(portfolio: Portfolio): PortfolioDto {
    const synced = syncLegacyFields(portfolio);
    return {
      id: synced.id,
      slug: synced.slug,
      published: synced.published,
      updatedAt: synced.updatedAt,
      announcementBar: { ...synced.announcementBar },
      faq: { ...synced.faq, items: synced.faq.items.map((i) => ({ ...i })) },
      newArrivals: { ...synced.newArrivals },
      brandStrip: { ...synced.brandStrip, logos: synced.brandStrip.logos.map((l) => ({ ...l })) },
      brand: { ...synced.brand },
      hero: { ...synced.hero, slides: synced.hero.slides.map((s) => ({ ...s })) },
      categoryShowcase: {
        ...synced.categoryShowcase,
        categoryNames: [...synced.categoryShowcase.categoryNames]
      },
      lookbook: { ...synced.lookbook },
      promoStrip: { ...synced.promoStrip },
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
      social: mapPortfolioLinksToLegacySocialDto(synced.social.links),
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
      theme: normalizePortfolioTheme(synced.theme)
    };
  }
}
