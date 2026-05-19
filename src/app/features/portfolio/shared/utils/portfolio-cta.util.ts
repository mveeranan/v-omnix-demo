import { PortfolioCta, PortfolioSocial } from '../../models/portfolio.model';

const INTERNAL_BOOKING_PATH = '/admin/bookings';

export function resolvePortfolioCtaUrl(cta: PortfolioCta, social: PortfolioSocial): string {
  switch (cta.type) {
    case 'whatsapp': {
      const phone = (cta.target || social.whatsapp).replace(/\D/g, '');
      return phone ? `https://wa.me/${phone}` : '#';
    }
    case 'internal':
      return cta.target || INTERNAL_BOOKING_PATH;
    case 'customUrl':
      return cta.target || '#';
    default:
      return '#';
  }
}

export function resolvePortfolioCtaExternal(cta: PortfolioCta): boolean {
  return cta.type === 'whatsapp' || cta.type === 'customUrl';
}
