import { Mapper } from '../../../shared/mappers/mapper';
import { PortfolioDto } from '../models/portfolio.dto';
import { Portfolio, createEmptyPortfolio } from '../models/portfolio.model';

const defaults = createEmptyPortfolio();

export class PortfolioMapper implements Mapper<PortfolioDto, Portfolio> {
  map(source: PortfolioDto): Portfolio {
    return {
      id: source.id,
      slug: source.slug,
      published: source.published,
      updatedAt: source.updatedAt,
      brand: { ...source.brand },
      about: {
        ...source.about,
        achievements: [...source.about.achievements],
        certifications: [...source.about.certifications]
      },
      services: source.services.map((s) => ({ ...s })),
      gallery: source.gallery.map((g) => ({ ...g })),
      reviews: source.reviews.map((r) => ({ ...r })),
      social: { ...source.social },
      team: {
        enabled: source.team.enabled,
        members: source.team.members.map((m) => ({ ...m }))
      },
      stats: { ...source.stats },
      cta: { ...source.cta },
      contact: source.contact ? { ...source.contact } : { ...defaults.contact },
      highlights: source.highlights
        ? { ...source.highlights, items: [...source.highlights.items] }
        : { ...defaults.highlights },
      theme: { ...source.theme }
    };
  }

  toDto(portfolio: Portfolio): PortfolioDto {
    return {
      id: portfolio.id,
      slug: portfolio.slug,
      published: portfolio.published,
      updatedAt: portfolio.updatedAt,
      brand: { ...portfolio.brand },
      about: {
        ...portfolio.about,
        achievements: [...portfolio.about.achievements],
        certifications: [...portfolio.about.certifications]
      },
      services: portfolio.services.map((s) => ({ ...s })),
      gallery: portfolio.gallery.map((g) => ({ ...g })),
      reviews: portfolio.reviews.map((r) => ({ ...r })),
      social: { ...portfolio.social },
      team: {
        enabled: portfolio.team.enabled,
        members: portfolio.team.members.map((m) => ({ ...m }))
      },
      stats: { ...portfolio.stats },
      cta: { ...portfolio.cta },
      contact: { ...portfolio.contact },
      highlights: { ...portfolio.highlights, items: [...portfolio.highlights.items] },
      theme: { ...portfolio.theme }
    };
  }
}
