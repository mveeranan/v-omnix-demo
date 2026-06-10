import { PortfolioCta, PortfolioSocial } from '../../models/portfolio.model';

const SHOP_PATH_PREFIX = '/shop';

export function resolvePortfolioCtaUrl(
  cta: PortfolioCta,
  social: PortfolioSocial,
  slug?: string
): string {
  switch (cta.type) {
    case 'whatsapp': {
      const phone = (cta.target || social.whatsapp).replace(/\D/g, '');
      return phone ? `https://wa.me/${phone}` : '#';
    }
    case 'internal': {
      if (cta.target?.trim()) {
        return cta.target;
      }
      const normalizedSlug = slug?.trim();
      return normalizedSlug ? `${SHOP_PATH_PREFIX}/${normalizedSlug}` : SHOP_PATH_PREFIX;
    }
    case 'customUrl':
      return cta.target || '#';
    default:
      return '#';
  }
}

export function resolvePortfolioCtaExternal(cta: PortfolioCta): boolean {
  return cta.type === 'whatsapp' || cta.type === 'customUrl';
}
