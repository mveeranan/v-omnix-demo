import {
  BarChart3,
  Building2,
  CreditCard,
  Github,
  Globe,
  Linkedin,
  LucideIconData,
  Package,
  ShieldCheck,
  ShoppingCart,
  Twitter
} from 'lucide-angular';

export interface HomeStatSeed {
  label: string;
  value: number;
  suffix?: string;
}

export interface HomeFeatureItem {
  icon: LucideIconData;
  title: string;
  description: string;
}

export interface HomeStepItem {
  title: string;
  description: string;
}

export interface HomeTestimonial {
  name: string;
  role: string;
  quote: string;
}

export interface HomeFaqItem {
  question: string;
  answer: string;
}

export interface HomeSocialLink {
  icon: LucideIconData;
  label: string;
  href: string;
}

export interface HomeShowcaseSlide {
  title: string;
  description: string;
  kpi: string;
  kpiLabel: string;
  backgroundClass: string;
}

export const HOME_STAT_SEEDS: HomeStatSeed[] = [
  { label: 'Stores', value: 100, suffix: '+' },
  { label: 'Orders', value: 1000, suffix: '+' },
  { label: 'Uptime', value: 99.9, suffix: '%' }
];

export const HOME_FEATURE_ITEMS: HomeFeatureItem[] = [
  {
    icon: Building2,
    title: 'Multi-tenant architecture',
    description: 'Manage unlimited brands and storefronts from one secure workspace.'
  },
  {
    icon: ShoppingCart,
    title: 'Full e-commerce stack',
    description: 'Catalog, cart, checkout, and order management built in.'
  },
  {
    icon: CreditCard,
    title: 'Payments tracking',
    description: 'Track revenue, refunds, and payouts with finance-grade transparency.'
  },
  {
    icon: Globe,
    title: 'Company website + shop',
    description: 'Publish a marketing homepage and a full product catalog in minutes.'
  },
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    description: 'Control permissions across admins, managers, and support teams.'
  },
  {
    icon: BarChart3,
    title: 'Analytics dashboard',
    description: 'Turn sales data into growth insights and conversion improvements.'
  }
];

export const HOME_STEPS: HomeStepItem[] = [
  {
    title: 'Create account',
    description: 'Launch your workspace and invite your first team members.'
  },
  {
    title: 'Setup your store',
    description: 'Add products, configure payments, and customize your website.'
  },
  {
    title: 'Publish & sell',
    description: 'Go live with your company website and full online shop.'
  },
  {
    title: 'Track growth',
    description: 'Use real-time analytics to improve sales and retention.'
  }
];

export const HOME_TESTIMONIALS: HomeTestimonial[] = [
  {
    name: 'Ayesha Khan',
    role: 'Founder, Lumina Boutique',
    quote:
      'Work Orbit cut our time-to-launch by weeks. We had a polished store live in days.'
  },
  {
    name: 'Marcus Reed',
    role: 'Founder, FlexFit Gear',
    quote:
      'The multi-tenant model made expansion simple. We launched two new stores in one sprint.'
  },
  {
    name: 'Noah Ibrahim',
    role: 'Head of Growth, NailHaus',
    quote:
      'The analytics dashboard helped us improve conversion from visit to purchase by 28%.'
  }
];

export const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    question: 'Can I manage multiple stores under one account?',
    answer:
      'Yes. Work Orbit is multi-tenant by design, so each store can run independently while sharing central reporting.'
  },
  {
    question: 'Does Work Orbit support online payments?',
    answer:
      'Yes. You can accept card, UPI, wallet, and COD payments, then track payout status from the dashboard.'
  },
  {
    question: 'Is there onboarding support for my team?',
    answer:
      'All plans include onboarding resources. Higher tiers include guided setup and migration support.'
  },
  {
    question: 'Can I switch plans later?',
    answer:
      'Absolutely. You can upgrade or downgrade at any time, and your store data remains intact.'
  }
];

export const HOME_SOCIAL_LINKS: HomeSocialLink[] = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' }
];

export const HOME_SHOWCASE_SLIDES: HomeShowcaseSlide[] = [
  {
    title: 'Centralized multi-store command center',
    description: 'Manage products, orders, and websites from one clean real-time workspace.',
    kpi: '12',
    kpiLabel: 'Active stores',
    backgroundClass: 'slide-bg-one'
  },
  {
    title: 'Storefront that converts faster',
    description: 'Track cart drop-offs and optimize your shop journey with funnel visibility.',
    kpi: '31%',
    kpiLabel: 'Conversion uplift',
    backgroundClass: 'slide-bg-two'
  },
  {
    title: 'Sales intelligence at a glance',
    description: 'Surface revenue, top products, and order health in one executive view.',
    kpi: '99.9%',
    kpiLabel: 'Platform uptime',
    backgroundClass: 'slide-bg-three'
  }
];

export function createHomeStatItems(): Array<HomeStatSeed & { displayValue: number }> {
  return HOME_STAT_SEEDS.map((item) => ({
    ...item,
    displayValue: item.label === 'Uptime' ? item.value : 0
  }));
}
