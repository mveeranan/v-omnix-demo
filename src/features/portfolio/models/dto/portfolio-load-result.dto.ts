import { BusinessProfileDto } from '@features/admin/models/business-profile.model';
import { UserDto } from '@features/admin/models/user.model';
import { Portfolio } from '../portfolio.model';

export interface PortfolioLoadResult {
  user: UserDto | null;
  businessProfile: BusinessProfileDto | null;
  presetId: string | null;
  portfolio: Portfolio | null;
}
