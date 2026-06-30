export interface PortfolioThemeDto {
  presetId: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  colorScheme?: 'amber' | 'teal' | 'rose' | 'indigo' | 'green' | 'slate';
  mode?: 'light' | 'dark';
  borderRadius?: string;
}

export interface PortfolioHeroSlideDto {
  id: string;
  imageUrl: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaTarget: string;
}

export interface PortfolioBrandDto {
  enabled?: boolean;
  logoUrl: string;
  businessName: string;
  tagline: string;
  coverImageUrl: string;
}

export interface PortfolioHeroDto {
  enabled: boolean;
  eyebrow?: string;
  headline: string;
  subheadline: string;
  secondaryCtaLabel: string;
  showTrustStrip: boolean;
  slides?: PortfolioHeroSlideDto[];
}

export interface PortfolioCategoryShowcaseDto {
  enabled: boolean;
  title: string;
  subtitle: string;
  categoryNames: string[];
  maxCount: number;
}

export interface PortfolioLookbookDto {
  enabled: boolean;
  title: string;
  subtitle: string;
}

export interface PortfolioPromoStripDto {
  enabled: boolean;
  text: string;
  buttonLabel: string;
  buttonTarget: string;
}

export interface PortfolioOfferBannerDto {
  enabled: boolean;
  productIds: string[];
}

export interface PortfolioSaleCollectionDto {
  enabled: boolean;
  title: string;
  subtitle: string;
  productIds: string[];
  maxCount: number;
}

export interface PortfolioStoreDescriptionDto {
  enabled: boolean;
  description: string;
  imageUrl?: string;
}

export interface PortfolioGallerySectionDto {
  enabled: boolean;
}

export interface PortfolioAboutDto {
  enabled: boolean;
  description: string;
  mission?: string;
  vision?: string;
  experience: string;
  achievements: string[];
  certifications: string[];
}

export interface PortfolioServiceItemDto {
  id: string;
  name: string;
  duration: string;
  price: string;
  category: string;
  featured: boolean;
  enabled: boolean;
}

export interface PortfolioGalleryItemDto {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  category: string;
  featured: boolean;
  sortOrder: number;
}

export interface PortfolioReviewsSectionDto {
  enabled: boolean;
}

export interface PortfolioReviewDto {
  id: string;
  author: string;
  text: string;
  rating: number;
  avatarUrl: string;
}

export interface PortfolioSocialSectionDto {
  enabled: boolean;
}

export interface PortfolioSocialDto {
  instagram: string;
  facebook: string;
  tiktok: string;
  whatsapp: string;
  website?: string;
  youtube: string;
}

export interface PortfolioFeaturedProductsDto {
  enabled: boolean;
  maxCount: number;
  productIds: string[];
  promoMarqueeText?: string;
  showQtyControls?: boolean;
}

export interface PortfolioStorePoliciesDto {
  enabled: boolean;
  returnPolicy: string;
  shippingInfo: string;
  deliveryTime: string;
}

export interface PortfolioContactSupportDto {
  enabled: boolean;
  phone: string;
  email: string;
  supportHours: string;
}

export interface PortfolioPaymentMethodsDto {
  enabled: boolean;
  upi: boolean;
  card: boolean;
  cod: boolean;
  wallet: boolean;
}

export interface PortfolioTrustBadgesDto {
  enabled: boolean;
  freeShipping: boolean;
  securePayment: boolean;
  moneyBack: boolean;
  fastDelivery: boolean;
  customerCountLabel: string;
}

export interface PortfolioNewsletterDto {
  enabled: boolean;
  heading: string;
  subheading: string;
  placeholder: string;
  buttonLabel: string;
}

export interface PortfolioHighlightItemDto {
  text: string;
  iconId: string;
}

export interface PortfolioTeamMemberDto {
  id: string;
  imageUrl: string;
  name: string;
  role: string;
  specialization: string;
  instagram: string;
}

export interface PortfolioTeamDto {
  enabled: boolean;
  members: PortfolioTeamMemberDto[];
}

export interface PortfolioStatsDto {
  enabled: boolean;
  yearsExperience: number;
  happyCustomers: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  /** Legacy fallback fields — optional for backwards compat. */
  bookingsCompleted?: number;
  ordersCompleted?: number;
}

export interface PortfolioCtaDto {
  type: 'whatsapp' | 'internal' | 'customUrl';
  label: string;
  target: string;
}

export interface PortfolioContactDto {
  enabled: boolean;
  email: string;
  phone: string;
  address: string;
  city: string;
  country?: string;
  whatsapp?: string;
  mapUrl?: string;
}

export interface PortfolioHighlightsDto {
  enabled: boolean;
  title: string;
  items: (string | PortfolioHighlightItemDto)[];
}

export interface PortfolioDto {
  id: string;
  slug: string;
  published: boolean;
  updatedAt: string;
  brand: PortfolioBrandDto;
  hero?: PortfolioHeroDto;
  categoryShowcase?: PortfolioCategoryShowcaseDto;
  lookbook?: PortfolioLookbookDto;
  promoStrip?: PortfolioPromoStripDto;
  offerBanner?: PortfolioOfferBannerDto;
  saleCollection?: PortfolioSaleCollectionDto;
  storeDescription?: PortfolioStoreDescriptionDto;
  gallerySection?: PortfolioGallerySectionDto;
  featuredProducts?: PortfolioFeaturedProductsDto;
  reviewsSection?: PortfolioReviewsSectionDto;
  contactSupport?: PortfolioContactSupportDto;
  paymentMethods?: PortfolioPaymentMethodsDto;
  storePolicies?: PortfolioStorePoliciesDto;
  trustBadges?: PortfolioTrustBadgesDto;
  newsletter?: PortfolioNewsletterDto;
  socialSection?: PortfolioSocialSectionDto;
  about: PortfolioAboutDto;
  services: PortfolioServiceItemDto[];
  gallery: PortfolioGalleryItemDto[];
  reviews: PortfolioReviewDto[];
  social: PortfolioSocialDto;
  team: PortfolioTeamDto;
  stats: PortfolioStatsDto;
  cta: PortfolioCtaDto;
  contact?: PortfolioContactDto;
  highlights?: PortfolioHighlightsDto;
  theme: PortfolioThemeDto;
}
