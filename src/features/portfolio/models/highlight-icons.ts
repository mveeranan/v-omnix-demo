import {
  Award,
  Banknote,
  BadgeCheck,
  Box,
  CheckCircle,
  Clock,
  CreditCard,
  Crown,
  DollarSign,
  Flame,
  Gift,
  Globe,
  Headphones,
  Heart,
  HeartHandshake,
  Infinity,
  Layers,
  Leaf,
  Lock,
  LucideIconData,
  MapPin,
  MessageCircle,
  Package,
  Percent,
  Receipt,
  RefreshCw,
  ShoppingBag,
  Shield,
  Smile,
  Sparkles,
  Star,
  Store,
  Tag,
  ThumbsUp,
  Truck,
  Users,
  Wallet,
  Zap
} from 'lucide-angular';

export interface HighlightIconOption {
  id: string;
  label: string;
  icon: LucideIconData;
  group: string;
}

export const HIGHLIGHT_ICON_OPTIONS: HighlightIconOption[] = [
  // Delivery & Logistics
  { id: 'truck',       label: 'Delivery',      icon: Truck,       group: 'Delivery' },
  { id: 'package',    label: 'Packaging',     icon: Package,     group: 'Delivery' },
  { id: 'globe',      label: 'Worldwide',     icon: Globe,       group: 'Delivery' },
  { id: 'map-pin',    label: 'Location',      icon: MapPin,      group: 'Delivery' },
  { id: 'clock',      label: 'Fast',          icon: Clock,       group: 'Delivery' },
  { id: 'zap',        label: 'Express',       icon: Zap,         group: 'Delivery' },
  { id: 'refresh-cw', label: 'Easy Returns',  icon: RefreshCw,   group: 'Delivery' },

  // Quality & Trust
  { id: 'shield',       label: 'Secure',       icon: Shield,       group: 'Quality' },
  { id: 'award',        label: 'Award',         icon: Award,        group: 'Quality' },
  { id: 'star',         label: 'Top Rated',     icon: Star,         group: 'Quality' },
  { id: 'check-circle', label: 'Guaranteed',    icon: CheckCircle,  group: 'Quality' },
  { id: 'sparkles',     label: 'Premium',       icon: Sparkles,     group: 'Quality' },
  { id: 'badge-check',  label: 'Certified',     icon: BadgeCheck,   group: 'Quality' },
  { id: 'thumbs-up',    label: 'Approved',      icon: ThumbsUp,     group: 'Quality' },
  { id: 'crown',        label: 'Best in Class', icon: Crown,        group: 'Quality' },
  { id: 'lock',         label: 'Safe',          icon: Lock,         group: 'Quality' },

  // Customer & Care
  { id: 'heart',           label: 'Care',          icon: Heart,          group: 'Customer' },
  { id: 'users',           label: 'Community',     icon: Users,          group: 'Customer' },
  { id: 'heart-handshake', label: 'Support',       icon: HeartHandshake, group: 'Customer' },
  { id: 'smile',           label: 'Satisfaction',  icon: Smile,          group: 'Customer' },
  { id: 'headphones',      label: '24/7 Help',     icon: Headphones,     group: 'Customer' },
  { id: 'message-circle',  label: 'Chat',          icon: MessageCircle,  group: 'Customer' },

  // Payment & Finance
  { id: 'credit-card', label: 'Payment',     icon: CreditCard, group: 'Payment' },
  { id: 'wallet',      label: 'Wallet',      icon: Wallet,     group: 'Payment' },
  { id: 'dollar-sign', label: 'Best Price',  icon: DollarSign, group: 'Payment' },
  { id: 'banknote',    label: 'Cash Back',   icon: Banknote,   group: 'Payment' },
  { id: 'receipt',     label: 'Invoice',     icon: Receipt,    group: 'Payment' },
  { id: 'percent',     label: 'Discount',    icon: Percent,    group: 'Payment' },

  // Products & Store
  { id: 'shopping-bag', label: 'Shop',       icon: ShoppingBag, group: 'Products' },
  { id: 'store',        label: 'In Store',   icon: Store,       group: 'Products' },
  { id: 'tag',          label: 'Deals',      icon: Tag,         group: 'Products' },
  { id: 'gift',         label: 'Gift',       icon: Gift,        group: 'Products' },
  { id: 'box',          label: 'Bundle',     icon: Box,         group: 'Products' },
  { id: 'layers',       label: 'Variety',    icon: Layers,      group: 'Products' },

  // Misc
  { id: 'leaf',     label: 'Eco-Friendly',  icon: Leaf,     group: 'Misc' },
  { id: 'flame',    label: 'Trending',      icon: Flame,    group: 'Misc' },
  { id: 'infinity', label: 'Always',        icon: Infinity, group: 'Misc' },
];

export const HIGHLIGHT_ICON_GROUPS = [...new Set(HIGHLIGHT_ICON_OPTIONS.map((o) => o.group))];

export function resolveHighlightIcon(iconId: string): LucideIconData {
  return HIGHLIGHT_ICON_OPTIONS.find((o) => o.id === iconId)?.icon ?? Sparkles;
}
