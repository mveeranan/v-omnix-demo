import {
  Award,
  Clock,
  Heart,
  LucideIconData,
  Package,
  Shield,
  Sparkles,
  Truck,
  Zap,
  Gift,
  CreditCard
} from 'lucide-angular';

export interface HighlightIconOption {
  id: string;
  label: string;
  icon: LucideIconData;
}

export const HIGHLIGHT_ICON_OPTIONS: HighlightIconOption[] = [
  { id: 'sparkles', label: 'Quality', icon: Sparkles },
  { id: 'shield', label: 'Secure', icon: Shield },
  { id: 'truck', label: 'Shipping', icon: Truck },
  { id: 'award', label: 'Award', icon: Award },
  { id: 'clock', label: 'Fast', icon: Clock },
  { id: 'heart', label: 'Care', icon: Heart },
  { id: 'package', label: 'Products', icon: Package },
  { id: 'zap', label: 'Speed', icon: Zap },
  { id: 'gift', label: 'Gift', icon: Gift },
  { id: 'credit-card', label: 'Payment', icon: CreditCard }
];

export function resolveHighlightIcon(iconId: string): LucideIconData {
  return HIGHLIGHT_ICON_OPTIONS.find((o) => o.id === iconId)?.icon ?? Sparkles;
}
