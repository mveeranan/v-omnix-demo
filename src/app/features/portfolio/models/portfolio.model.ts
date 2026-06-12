export type PortfolioCtaType = 'whatsapp' | 'internal' | 'customUrl';
export type PortfolioThemeMode = 'light' | 'dark';
export type GalleryMediaType = 'image' | 'video';

export interface PortfolioTheme {
  presetId: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  mode: PortfolioThemeMode;
}

export interface PortfolioBrand {
  enabled: boolean;
  logoUrl: string;
  businessName: string;
  tagline: string;
  coverImageUrl: string;
}

export interface PortfolioHero {
  enabled: boolean;
  eyebrow: string;
  headline: string;
  subheadline: string;
  secondaryCtaLabel: string;
  showTrustStrip: boolean;
}

export interface PortfolioOfferBanner {
  enabled: boolean;
  productIds: string[];
}

export interface PortfolioSaleCollection {
  enabled: boolean;
  title: string;
  subtitle: string;
  productIds: string[];
  maxCount: number;
}

export interface PortfolioStoreDescription {
  enabled: boolean;
  description: string;
}

export interface PortfolioGallerySection {
  enabled: boolean;
}

export interface PortfolioServiceItem {
  id: string;
  name: string;
  duration: string;
  price: string;
  category: string;
  featured: boolean;
  enabled: boolean;
}

export interface PortfolioGalleryItem {
  id: string;
  type: GalleryMediaType;
  url: string;
  thumbnailUrl: string;
  category: string;
  featured: boolean;
  sortOrder: number;
}

export interface PortfolioReviewsSection {
  enabled: boolean;
}

export interface PortfolioReview {
  id: string;
  author: string;
  text: string;
  rating: number;
  avatarUrl: string;
}

export interface PortfolioSocialSection {
  enabled: boolean;
}

export interface PortfolioSocial {
  instagram: string;
  facebook: string;
  tiktok: string;
  whatsapp: string;
  youtube: string;
}

export interface PortfolioFeaturedProducts {
  enabled: boolean;
  maxCount: number;
  productIds: string[];
  promoMarqueeText: string;
  showQtyControls: boolean;
}

export interface PortfolioStorePolicies {
  enabled: boolean;
  returnPolicy: string;
  shippingInfo: string;
  deliveryTime: string;
}

export interface PortfolioContactSupport {
  enabled: boolean;
  phone: string;
  email: string;
  supportHours: string;
}

export interface PortfolioPaymentMethods {
  enabled: boolean;
  upi: boolean;
  card: boolean;
  cod: boolean;
  wallet: boolean;
}

export interface PortfolioTrustBadges {
  enabled: boolean;
  freeShipping: boolean;
  securePayment: boolean;
  moneyBack: boolean;
  fastDelivery: boolean;
  customerCountLabel: string;
}

export interface PortfolioNewsletter {
  enabled: boolean;
  heading: string;
  subheading: string;
  placeholder: string;
  buttonLabel: string;
}

export interface PortfolioHighlightItem {
  text: string;
  iconId: string;
}

export interface PortfolioHighlights {
  enabled: boolean;
  title: string;
  items: PortfolioHighlightItem[];
}

export interface PortfolioTeamMember {
  id: string;
  imageUrl: string;
  name: string;
  role: string;
  specialization: string;
  instagram: string;
}

export interface PortfolioTeam {
  enabled: boolean;
  members: PortfolioTeamMember[];
}

export interface PortfolioStats {
  enabled: boolean;
  bookingsCompleted: number;
  ordersCompleted?: number;
  yearsExperience: number;
  happyCustomers: number;
  totalProducts?: number;
  totalOrders?: number;
  totalCustomers?: number;
}

export interface PortfolioCta {
  type: PortfolioCtaType;
  label: string;
  target: string;
}

/** @deprecated Synced from storeDescription for public pages */
export interface PortfolioAbout {
  enabled: boolean;
  description: string;
  mission?: string;
  vision?: string;
  experience: string;
  achievements: string[];
  certifications: string[];
}

/** @deprecated Synced from contactSupport for public pages */
export interface PortfolioContact {
  enabled: boolean;
  email: string;
  phone: string;
  address: string;
  city: string;
  country?: string;
  whatsapp?: string;
  mapUrl?: string;
}

export interface Portfolio {
  id: string;
  slug: string;
  published: boolean;
  updatedAt: string;
  brand: PortfolioBrand;
  hero: PortfolioHero;
  offerBanner: PortfolioOfferBanner;
  saleCollection: PortfolioSaleCollection;
  storeDescription: PortfolioStoreDescription;
  gallerySection: PortfolioGallerySection;
  gallery: PortfolioGalleryItem[];
  featuredProducts: PortfolioFeaturedProducts;
  reviewsSection: PortfolioReviewsSection;
  reviews: PortfolioReview[];
  contactSupport: PortfolioContactSupport;
  paymentMethods: PortfolioPaymentMethods;
  storePolicies: PortfolioStorePolicies;
  trustBadges: PortfolioTrustBadges;
  newsletter: PortfolioNewsletter;
  socialSection: PortfolioSocialSection;
  social: PortfolioSocial;
  cta: PortfolioCta;
  theme: PortfolioTheme;
  about: PortfolioAbout;
  services: PortfolioServiceItem[];
  team: PortfolioTeam;
  stats: PortfolioStats;
  contact: PortfolioContact;
  highlights: PortfolioHighlights;
}

export function createEmptyPortfolio(): Portfolio {
  return {
    id: '',
    slug: '',
    published: false,
    updatedAt: new Date().toISOString(),
    brand: {
      enabled: true,
      logoUrl: '',
      businessName: '',
      tagline: '',
      coverImageUrl: ''
    },
    hero: {
      enabled: true,
      eyebrow: 'special offer',
      headline: 'top collection',
      subheadline: '',
      secondaryCtaLabel: 'Contact us',
      showTrustStrip: false
    },
    offerBanner: {
      enabled: true,
      productIds: []
    },
    saleCollection: {
      enabled: true,
      title: 'Biggest offer of the sale',
      subtitle: 'Discover the latest trends and styles at our store.',
      productIds: [],
      maxCount: 4
    },
    storeDescription: {
      enabled: true,
      description: ''
    },
    gallerySection: { enabled: true },
    gallery: [],
    featuredProducts: {
      enabled: true,
      maxCount: 12,
      productIds: [],
      promoMarqueeText: 'Limited Time Offer: 5% off',
      showQtyControls: true
    },
    reviewsSection: { enabled: true },
    reviews: [],
    contactSupport: {
      enabled: true,
      phone: '',
      email: '',
      supportHours: ''
    },
    paymentMethods: {
      enabled: false,
      upi: true,
      card: true,
      cod: false,
      wallet: false
    },
    storePolicies: {
      enabled: false,
      returnPolicy: '',
      shippingInfo: '',
      deliveryTime: ''
    },
    trustBadges: {
      enabled: true,
      freeShipping: true,
      securePayment: true,
      moneyBack: false,
      fastDelivery: true,
      customerCountLabel: ''
    },
    newsletter: {
      enabled: true,
      heading: 'KNOW IT ALL FIRST!',
      subheading: 'Never miss anything by signing up to our newsletter.',
      placeholder: 'Enter your email',
      buttonLabel: 'Subscribe'
    },
    socialSection: { enabled: true },
    social: {
      instagram: '',
      facebook: '',
      tiktok: '',
      whatsapp: '',
      youtube: ''
    },
    cta: {
      type: 'internal',
      label: 'Shop Now',
      target: ''
    },
    theme: {
      presetId: 'multikart-fashion-seven',
      primaryColor: '#222222',
      accentColor: '#ff4c3b',
      fontFamily: 'Lato, sans-serif',
      borderRadius: '0',
      mode: 'light'
    },
    about: {
      enabled: true,
      description: '',
      mission: '',
      vision: '',
      experience: '',
      achievements: [],
      certifications: []
    },
    services: [],
    team: { enabled: false, members: [] },
    stats: {
      enabled: false,
      bookingsCompleted: 0,
      yearsExperience: 0,
      happyCustomers: 0
    },
    contact: {
      enabled: true,
      email: '',
      phone: '',
      address: '',
      city: ''
    },
    highlights: {
      enabled: true,
      title: 'Our services',
      items: [
        { text: 'Free Shipping', iconId: 'truck' },
        { text: '24 x 7 Service', iconId: 'clock' },
        { text: 'Festival Offer', iconId: 'gift' },
        { text: 'Online Payment', iconId: 'credit-card' }
      ]
    }
  };
}
