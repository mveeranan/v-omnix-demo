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
  logoUrl: string;
  businessName: string;
  tagline: string;
  coverImageUrl: string;
}

export interface PortfolioAbout {
  enabled: boolean;
  description: string;
  experience: string;
  achievements: string[];
  certifications: string[];
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

export interface PortfolioReview {
  id: string;
  author: string;
  text: string;
  rating: number;
  avatarUrl: string;
}

export interface PortfolioSocial {
  instagram: string;
  facebook: string;
  tiktok: string;
  whatsapp: string;
  website: string;
  youtube: string;
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
  yearsExperience: number;
  happyCustomers: number;
}

export interface PortfolioCta {
  type: PortfolioCtaType;
  label: string;
  target: string;
}

export interface PortfolioContact {
  enabled: boolean;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export interface PortfolioHighlights {
  enabled: boolean;
  title: string;
  items: string[];
}

export interface Portfolio {
  id: string;
  slug: string;
  published: boolean;
  updatedAt: string;
  brand: PortfolioBrand;
  about: PortfolioAbout;
  services: PortfolioServiceItem[];
  gallery: PortfolioGalleryItem[];
  reviews: PortfolioReview[];
  social: PortfolioSocial;
  team: PortfolioTeam;
  stats: PortfolioStats;
  cta: PortfolioCta;
  contact: PortfolioContact;
  highlights: PortfolioHighlights;
  theme: PortfolioTheme;
}

export function createEmptyPortfolio(): Portfolio {
  return {
    id: '',
    slug: '',
    published: false,
    updatedAt: new Date().toISOString(),
    brand: {
      logoUrl: '',
      businessName: '',
      tagline: '',
      coverImageUrl: ''
    },
    about: {
      enabled: true,
      description: '',
      experience: '',
      achievements: [],
      certifications: []
    },
    services: [],
    gallery: [],
    reviews: [],
    social: {
      instagram: '',
      facebook: '',
      tiktok: '',
      whatsapp: '',
      website: '',
      youtube: ''
    },
    team: { enabled: false, members: [] },
    stats: {
      enabled: true,
      bookingsCompleted: 0,
      yearsExperience: 0,
      happyCustomers: 0
    },
    cta: {
      type: 'whatsapp',
      label: 'Book now',
      target: ''
    },
    contact: {
      enabled: false,
      email: '',
      phone: '',
      address: '',
      city: ''
    },
    highlights: {
      enabled: true,
      title: 'Why clients choose us',
      items: []
    },
    theme: {
      presetId: 'minimal-white',
      primaryColor: '#0f172a',
      accentColor: '#c9a227',
      fontFamily: 'Georgia, serif',
      borderRadius: '0.75rem',
      mode: 'light'
    }
  };
}
