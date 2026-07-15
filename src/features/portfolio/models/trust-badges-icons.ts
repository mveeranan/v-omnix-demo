import {
  Award,
  BadgeCheck,
  Clock,
  CreditCard,
  Headphones,
  Heart,
  Lock,
  LucideIconData,
  Package,
  RefreshCw,
  Shield,
  ShoppingBag,
  Smile,
  Star,
  ThumbsUp,
  Truck,
  Users,
  Wallet,
  Zap
} from 'lucide-angular';

export interface TrustBadgeIconOption {
  id: string;
  label: string;
  icon: LucideIconData;
}

export const TRUST_BADGE_ICON_OPTIONS: TrustBadgeIconOption[] = [
  // Delivery & Logistics
  { id: 'Truck', label: 'Fast Delivery', icon: Truck },
  { id: 'Package', label: 'Packaging', icon: Package },
  { id: 'Clock', label: 'Quick Service', icon: Clock },
  { id: 'Zap', label: 'Express', icon: Zap },

  // Quality & Trust
  { id: 'Shield', label: 'Secure', icon: Shield },
  { id: 'Lock', label: 'Safe Payment', icon: Lock },
  { id: 'Award', label: 'Award Winning', icon: Award },
  { id: 'Star', label: 'Top Rated', icon: Star },
  { id: 'BadgeCheck', label: 'Certified', icon: BadgeCheck },
  { id: 'ThumbsUp', label: 'Approved', icon: ThumbsUp },

  // Returns & Satisfaction
  { id: 'RefreshCw', label: 'Easy Returns', icon: RefreshCw },
  { id: 'Smile', label: 'Satisfaction Guaranteed', icon: Smile },

  // Customer & Support
  { id: 'Heart', label: 'Customer Care', icon: Heart },
  { id: 'Users', label: 'Trusted by Many', icon: Users },
  { id: 'Headphones', label: '24/7 Support', icon: Headphones },

  // Payment & Value
  { id: 'CreditCard', label: 'Payment Options', icon: CreditCard },
  { id: 'Wallet', label: 'Wallet Friendly', icon: Wallet },
  { id: 'ShoppingBag', label: 'Quality Products', icon: ShoppingBag }
];

export function resolveTrustBadgeIcon(iconName: string): LucideIconData {
  return TRUST_BADGE_ICON_OPTIONS.find((o) => o.id === iconName)?.icon ?? Shield;
}

export function getTrustBadgeIconLabel(iconName: string): string {
  return TRUST_BADGE_ICON_OPTIONS.find((o) => o.id === iconName)?.label ?? 'Badge';
}
