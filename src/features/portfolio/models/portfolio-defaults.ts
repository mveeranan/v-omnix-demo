import { SocialMediaType } from '@shared/models/enums/social-media-type.enum';
import {
  Portfolio,
  PortfolioGalleryItem,
  PortfolioReview,
  createEmptyPortfolio
} from './portfolio.model';

export const DEFAULT_TENANT_DRAFT_SLUG = 'my-store';

const PLACEHOLDER_LOGO =
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80';
const PLACEHOLDER_STORY =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80';

const DEFAULT_GALLERY: PortfolioGalleryItem[] = [
  {
    id: 'lb-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&q=80',
    category: 'lookbook',
    featured: true,
    sortOrder: 0
  },
  {
    id: 'lb-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1596993100471-c3905dafa78e?w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596993100471-c3905dafa78e?w=600&q=80',
    category: 'lookbook',
    featured: false,
    sortOrder: 1
  },
  {
    id: 'lb-3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',
    category: 'lookbook',
    featured: false,
    sortOrder: 2
  },
  {
    id: 'lb-4',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80',
    category: 'lookbook',
    featured: false,
    sortOrder: 3
  },
  {
    id: 'lb-5',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=600&q=80',
    category: 'lookbook',
    featured: false,
    sortOrder: 4
  },
  {
    id: 'lb-6',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
    category: 'lookbook',
    featured: false,
    sortOrder: 5
  }
];

const DEFAULT_REVIEWS: PortfolioReview[] = [
  {
    id: 'rev-1',
    author: 'Sarah M.',
    text: 'Great quality and fast delivery. Will definitely order again!',
    rating: 5,
    avatarUrl: ''
  },
  {
    id: 'rev-2',
    author: 'James K.',
    text: 'The product matched the photos perfectly. Checkout was smooth.',
    rating: 5,
    avatarUrl: ''
  },
  {
    id: 'rev-3',
    author: 'Priya R.',
    text: 'Love the selection and customer support was very helpful.',
    rating: 4,
    avatarUrl: ''
  }
];

/** Full sample website used for new tenants and to backfill empty builder sections. */
export function createDefaultWebsitePortfolio(): Portfolio {
  const base = createEmptyPortfolio();
  return {
    ...base,
    id: 'draft-1',
    slug: DEFAULT_TENANT_DRAFT_SLUG,
    published: true,
    theme: {
      ...base.theme,
      presetId: 'mox-ecommerce',
      primaryColor: '#263238',
      accentColor: '#ff6f00',
      fontFamily: 'Roboto, sans-serif',
      borderRadius: '8px',
      mode: 'light',
      colorScheme: 'amber'
    },
    brand: {
      enabled: true,
      logoUrl: PLACEHOLDER_LOGO,
      businessName: 'My Store',
      tagline: 'Quality products, delivered with care',
      coverImageUrl: ''
    },
    hero: {
      enabled: true,
      eyebrow: '',
      headline: '',
      subheadline: '',
      secondaryCtaLabel: 'Contact us',
      showTrustStrip: false,
      slides: []
    },
    categoryShowcase: {
      enabled: true,
      title: 'Shop by category',
      subtitle: 'Browse our most popular collections',
      categoryNames: [],
      maxCount: 4
    },
    storeDescription: {
      enabled: true,
      description:
        'We hand-pick every item in our catalog so you get reliable quality, fair prices, and a shopping experience you can trust. From everyday essentials to seasonal favorites, our store is built for you.',
      imageUrl: PLACEHOLDER_STORY
    },
    featuredProducts: {
      enabled: true,
      maxCount: 8,
      productIds: [],
      promoMarqueeText: 'Limited time — free shipping on orders over $50',
      showQtyControls: false
    },
    offerBanner: {
      enabled: true,
      productIds: []
    },
    saleCollection: {
      enabled: true,
      title: 'Biggest offers this week',
      subtitle: 'Save on bestsellers while stock lasts.',
      productIds: [],
      maxCount: 4
    },
    lookbook: {
      enabled: true,
      title: 'Lookbook',
      subtitle: 'Style inspiration from our latest arrivals'
    },
    gallerySection: { enabled: true },
    gallery: DEFAULT_GALLERY.map((g) => ({ ...g })),
    reviewsSection: { enabled: true },
    reviews: DEFAULT_REVIEWS.map((r) => ({ ...r })),
    highlights: {
      enabled: true,
      title: 'Why choose us',
      items: [
        { text: 'Free shipping over $50', iconId: 'truck' },
        { text: 'Secure checkout', iconId: 'shield' },
        { text: 'Easy returns', iconId: 'gift' },
        { text: '24/7 support', iconId: 'clock' }
      ]
    },
    stats: {
      enabled: true,
      bookingsCompleted: 0,
      ordersCompleted: 120,
      yearsExperience: 5,
      happyCustomers: 480,
      totalProducts: 8,
      totalOrders: 120,
      totalCustomers: 480
    },
    newsletter: {
      enabled: true,
      heading: 'Stay in the loop',
      subheading: 'Get new arrivals, offers, and tips — no spam.',
      placeholder: 'Enter your email',
      buttonLabel: 'Subscribe'
    },
    contactSupport: {
      enabled: true,
      phone: '555-0100',
      email: 'hello@mystore.example.com',
      supportHours: 'Mon–Sat, 9 AM – 6 PM'
    },
    contact: {
      enabled: true,
      email: 'hello@mystore.example.com',
      phone: '555-0100',
      address: '123 Market Street',
      city: 'San Francisco, CA'
    },
    promoStrip: {
      enabled: true,
      text: 'Free shipping on orders over $50 — shop the full catalog today',
      buttonLabel: 'Shop now',
      buttonTarget: ''
    },
    socialSection: { enabled: true },
    social: {
      links: [
        { id: 'default-instagram', type: SocialMediaType.Instagram, url: 'https://instagram.com' },
        { id: 'default-facebook', type: SocialMediaType.Facebook, url: 'https://facebook.com' }
      ]
    },
    cta: {
      type: 'internal',
      label: 'Shop Now',
      target: ''
    }
  };
}

/** Fill empty section content without overwriting saved edits. */
export function mergeWithWebsiteDefaults(portfolio: Portfolio): Portfolio {
  const defaults = createDefaultWebsitePortfolio();
  const merged: Portfolio = {
    ...defaults,
    ...portfolio,
    brand: {
      ...defaults.brand,
      ...portfolio.brand,
      businessName: portfolio.brand.businessName?.trim() || defaults.brand.businessName,
      tagline: portfolio.brand.tagline?.trim() || defaults.brand.tagline,
      logoUrl: portfolio.brand.logoUrl?.trim() || defaults.brand.logoUrl
    },
    hero: {
      ...defaults.hero,
      ...portfolio.hero,
      slides: portfolio.hero.slides ?? []
    },
    storeDescription: {
      ...defaults.storeDescription,
      ...portfolio.storeDescription,
      description:
        portfolio.storeDescription.description?.trim() || defaults.storeDescription.description,
      imageUrl: portfolio.storeDescription.imageUrl?.trim() || defaults.storeDescription.imageUrl
    },
    categoryShowcase: {
      ...defaults.categoryShowcase,
      ...portfolio.categoryShowcase,
      categoryNames: portfolio.categoryShowcase.categoryNames?.length
        ? portfolio.categoryShowcase.categoryNames
        : defaults.categoryShowcase.categoryNames
    },
    featuredProducts: {
      ...defaults.featuredProducts,
      ...portfolio.featuredProducts,
      productIds: portfolio.featuredProducts.productIds ?? defaults.featuredProducts.productIds
    },
    offerBanner: {
      ...defaults.offerBanner,
      ...portfolio.offerBanner,
      productIds: portfolio.offerBanner.productIds ?? defaults.offerBanner.productIds
    },
    saleCollection: {
      ...defaults.saleCollection,
      ...portfolio.saleCollection,
      productIds: portfolio.saleCollection.productIds ?? defaults.saleCollection.productIds
    },
    gallery: portfolio.gallery?.length ? portfolio.gallery : defaults.gallery,
    reviews: portfolio.reviews?.length ? portfolio.reviews : defaults.reviews,
    contactSupport: {
      ...defaults.contactSupport,
      ...portfolio.contactSupport,
      phone: portfolio.contactSupport.phone?.trim() || defaults.contactSupport.phone,
      email: portfolio.contactSupport.email?.trim() || defaults.contactSupport.email,
      supportHours: portfolio.contactSupport.supportHours?.trim() || defaults.contactSupport.supportHours
    },
    highlights: {
      ...defaults.highlights,
      ...portfolio.highlights,
      items: portfolio.highlights.items?.length ? portfolio.highlights.items : defaults.highlights.items
    },
    stats: {
      ...defaults.stats,
      ...portfolio.stats,
      totalProducts: portfolio.stats.totalProducts || defaults.stats.totalProducts,
      totalOrders:
        portfolio.stats.totalOrders ||
        portfolio.stats.ordersCompleted ||
        defaults.stats.totalOrders,
      totalCustomers:
        portfolio.stats.totalCustomers ||
        portfolio.stats.happyCustomers ||
        defaults.stats.totalCustomers,
      yearsExperience: portfolio.stats.yearsExperience || defaults.stats.yearsExperience
    },
    promoStrip: {
      ...defaults.promoStrip,
      ...portfolio.promoStrip,
      text: portfolio.promoStrip.text?.trim() || defaults.promoStrip.text
    },
    trustBadges: {
      ...portfolio.trustBadges,
      enabled: portfolio.trustBadges.enabled,
      badges: portfolio.trustBadges.badges?.length ? portfolio.trustBadges.badges : defaults.trustBadges.badges
    },
    social: {
      links: portfolio.social.links?.length ? portfolio.social.links : defaults.social.links
    }
  };

  merged.about = {
    ...merged.about,
    description: merged.storeDescription.description
  };
  merged.contact = {
    ...merged.contact,
    email: merged.contactSupport.email,
    phone: merged.contactSupport.phone
  };

  return merged;
}
