import { Portfolio, createEmptyPortfolio } from '../models/portfolio.model';

const PLACEHOLDER_COVER =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=80';
const PLACEHOLDER_LOGO =
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80';

function enrich(base: Partial<Portfolio> & Pick<Portfolio, 'id' | 'slug' | 'brand' | 'about'>): Portfolio {
  const empty = createEmptyPortfolio();
  return {
    ...empty,
    ...base,
    brand: { ...empty.brand, ...base.brand, enabled: base.brand.enabled ?? true },
    hero: base.hero ?? {
      ...empty.hero,
      eyebrow: empty.hero.eyebrow,
      headline: base.brand.businessName || empty.hero.headline,
      subheadline: base.brand.tagline,
      slides: []
    },
    categoryShowcase: base.categoryShowcase ?? { ...empty.categoryShowcase },
    lookbook: base.lookbook ?? { ...empty.lookbook },
    promoStrip: base.promoStrip ?? { ...empty.promoStrip },
    offerBanner: base.offerBanner ?? { ...empty.offerBanner },
    saleCollection: base.saleCollection ?? { ...empty.saleCollection },
    storeDescription: base.storeDescription ?? {
      enabled: base.about?.enabled ?? true,
      description: base.about?.description ?? '',
      imageUrl: base.brand?.coverImageUrl ?? ''
    },
    gallerySection: base.gallerySection ?? { enabled: true },
    gallery: base.gallery ?? [],
    featuredProducts: base.featuredProducts ?? { ...empty.featuredProducts },
    reviewsSection: base.reviewsSection ?? { enabled: true },
    reviews: base.reviews ?? [],
    contactSupport: base.contactSupport ?? {
      enabled: base.contact?.enabled ?? true,
      phone: base.contact?.phone ?? '',
      email: base.contact?.email ?? '',
      supportHours: 'Mon–Sat, 9 AM – 6 PM'
    },
    paymentMethods: base.paymentMethods ?? { ...empty.paymentMethods, enabled: true },
    storePolicies: base.storePolicies ?? {
      enabled: true,
      returnPolicy: '30-day returns on unused items.',
      shippingInfo: 'Free shipping on orders over $50.',
      deliveryTime: '3–5 business days'
    },
    trustBadges: base.trustBadges ?? { ...empty.trustBadges },
    newsletter: base.newsletter ?? { ...empty.newsletter },
    socialSection: base.socialSection ?? { enabled: true },
    social: { ...empty.social, ...(base.social ?? {}) },
    about: { ...empty.about, ...base.about },
    services: base.services ?? [],
    team: base.team ?? empty.team,
    stats: base.stats ?? empty.stats,
    cta: base.cta ?? empty.cta,
    contact: base.contact ?? empty.contact,
    highlights: base.highlights ?? empty.highlights,
    theme: base.theme ?? empty.theme
  };
}

export const MOCK_PORTFOLIOS: Portfolio[] = [
  enrich({
    id: 'pf-1',
    slug: 'inkmasters',
    published: true,
    updatedAt: new Date().toISOString(),
    brand: {
      enabled: true,
      logoUrl: PLACEHOLDER_LOGO,
      businessName: 'Ink Masters Studio',
      tagline: 'Art that lives on skin',
      coverImageUrl: PLACEHOLDER_COVER
    },
    about: {
      enabled: true,
      description:
        'Award-winning tattoo studio specializing in custom designs, cover-ups, and fine-line artistry. Every piece tells your story.',
      experience: '12+ years crafting unique body art',
      achievements: ['Best Studio 2024', '5000+ clients', 'Featured in Ink Magazine'],
      certifications: ['Bloodborne Pathogen Certified', 'Health Dept. Licensed']
    },
    services: [
      {
        id: 's1',
        name: 'Custom Tattoo',
        duration: '2-4 hrs',
        price: 'From $200',
        category: 'Tattoo',
        featured: true,
        enabled: true
      }
    ],
    gallery: [
      {
        id: 'lb-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80',
        category: 'lookbook',
        featured: true,
        sortOrder: 0
      },
      {
        id: 'lb-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
        category: 'lookbook',
        featured: false,
        sortOrder: 1
      },
      {
        id: 'g3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=400&q=80',
        category: 'Tattoo',
        featured: false,
        sortOrder: 2
      }
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Alex M.',
        text: 'Incredible artistry and a spotless studio. Highly recommend!',
        rating: 5,
        avatarUrl: ''
      }
    ],
    social: {
      instagram: 'https://instagram.com/inkmasters',
      facebook: 'https://facebook.com/inkmasters',
      tiktok: '',
      whatsapp: '+15551234567',
      youtube: ''
    },
    stats: {
      enabled: true,
      bookingsCompleted: 5200,
      totalOrders: 5200,
      yearsExperience: 12,
      happyCustomers: 4800,
      totalCustomers: 4800,
      totalProducts: 8
    },
    cta: { type: 'internal', label: 'Shop Now', target: '' },
    contact: {
      enabled: true,
      email: 'hello@inkmasters.example.com',
      phone: '5551234567',
      address: '142 Ink Street',
      city: 'Los Angeles, CA',
      country: 'USA',
      whatsapp: '+15551234567'
    },
    highlights: {
      enabled: true,
      title: 'Why choose us',
      items: [
        { text: 'Authentic Products', iconId: 'sparkles' },
        { text: 'Fast Delivery', iconId: 'truck' },
        { text: 'Secure Payments', iconId: 'shield' },
        { text: 'Customer Support', iconId: 'heart' }
      ]
    },
    categoryShowcase: {
      enabled: true,
      title: 'Shop by category',
      subtitle: 'Find what you need fast',
      categoryNames: ['Apparel', 'Accessories', 'Home', 'Electronics'],
      maxCount: 4
    },
    lookbook: { enabled: true, title: 'Studio lookbook', subtitle: 'Curated lifestyle shots' },
    hero: {
      enabled: true,
      eyebrow: 'new collection',
      headline: 'Ink Masters Studio',
      subheadline: 'Art that lives on skin',
      secondaryCtaLabel: 'Contact us',
      showTrustStrip: false,
      slides: [
        {
          id: 'slide-1',
          imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1600&q=80',
          headline: 'Premium merch & aftercare',
          subheadline: 'Shop studio-branded apparel and essentials',
          ctaLabel: 'Shop now',
          ctaTarget: ''
        },
        {
          id: 'slide-2',
          imageUrl: PLACEHOLDER_COVER,
          headline: 'Award-winning studio',
          subheadline: 'Trusted by thousands of clients',
          ctaLabel: 'Browse catalog',
          ctaTarget: ''
        }
      ]
    },
    theme: {
      presetId: 'mox-ecommerce',
      primaryColor: '#263238',
      accentColor: '#ff6f00',
      fontFamily: 'Roboto, sans-serif',
      borderRadius: '8px',
      mode: 'light',
      colorScheme: 'amber'
    }
  }),
  enrich({
    id: 'pf-2',
    slug: 'luxesalon',
    published: true,
    updatedAt: new Date().toISOString(),
    brand: {
      enabled: true,
      logoUrl: PLACEHOLDER_LOGO,
      businessName: 'Luxe Salon & Spa',
      tagline: 'Where beauty meets tranquility',
      coverImageUrl: PLACEHOLDER_COVER
    },
    about: {
      enabled: true,
      description:
        'Premier salon offering luxury hair, skin, and wellness treatments in an elegant, relaxing environment.',
      experience: '15 years of excellence in beauty care',
      achievements: ['Top Salon Award 2023'],
      certifications: ['Licensed Cosmetologists']
    },
    gallery: [
      {
        id: 'g1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
        category: 'Products',
        featured: true,
        sortOrder: 0
      },
      {
        id: 'g2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
        category: 'Products',
        featured: false,
        sortOrder: 1
      },
      {
        id: 'g3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&q=80',
        category: 'Products',
        featured: false,
        sortOrder: 2
      }
    ],
    reviews: [],
    social: {
      instagram: 'https://instagram.com/luxesalon',
      facebook: '',
      tiktok: '',
      whatsapp: '',
      youtube: ''
    },
    cta: { type: 'internal', label: 'Shop Now', target: '' },
    contact: {
      enabled: true,
      email: 'book@luxesalon.example.com',
      phone: '5559876543',
      address: '88 Beauty Lane',
      city: 'Miami, FL'
    },
    theme: {
      presetId: 'mox-ecommerce',
      primaryColor: '#263238',
      accentColor: '#e91e63',
      fontFamily: 'Roboto, sans-serif',
      borderRadius: '8px',
      mode: 'light',
      colorScheme: 'rose'
    }
  })
];
