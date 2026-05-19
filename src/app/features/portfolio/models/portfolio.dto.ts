export interface PortfolioThemeDto {
  presetId: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  mode: 'light' | 'dark';
}

export interface PortfolioBrandDto {
  logoUrl: string;
  businessName: string;
  tagline: string;
  coverImageUrl: string;
}

export interface PortfolioAboutDto {
  enabled: boolean;
  description: string;
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

export interface PortfolioReviewDto {
  id: string;
  author: string;
  text: string;
  rating: number;
  avatarUrl: string;
}

export interface PortfolioSocialDto {
  instagram: string;
  facebook: string;
  tiktok: string;
  whatsapp: string;
  website: string;
  youtube: string;
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
  bookingsCompleted: number;
  yearsExperience: number;
  happyCustomers: number;
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
}

export interface PortfolioHighlightsDto {
  enabled: boolean;
  title: string;
  items: string[];
}

export interface PortfolioDto {
  id: string;
  slug: string;
  published: boolean;
  updatedAt: string;
  brand: PortfolioBrandDto;
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
