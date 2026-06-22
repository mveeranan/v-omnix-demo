import { BusinessProfileDto } from '@features/admin/models/business-profile.model';
import { UserDto } from '@features/admin/models/user.model';
import { Portfolio } from '../portfolio.model';
import { HeroSlideDto } from '../hero-slides.model';
import { SocialMediaDto } from '../social-media.model';

export interface PortfolioLoadResult {
  user: UserDto | null;
  businessProfile: BusinessProfileDto | null;
  presetId: string | null;
  heroSlides: HeroSlideDto[];
  socialMedia: SocialMediaDto | null;
  portfolio: Portfolio | null;
}
