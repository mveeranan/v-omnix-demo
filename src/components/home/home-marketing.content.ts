import {
  BarChart3,
  Building2,
  Calendar,
  CreditCard,
  Github,
  Globe,
  Linkedin,
  LucideIconData,
  ShieldCheck,
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
  { label: 'Businesses', value: 100, suffix: '+' },
  { label: 'Bookings', value: 1000, suffix: '+' },
  { label: 'Uptime', value: 99.9, suffix: '%' }
];

export const HOME_FEATURE_ITEMS: HomeFeatureItem[] = [
  {
    icon: Building2,
    title: 'Multi-tenant architecture',
    description: 'Manage unlimited brands and locations from one secure workspace.'
  },
  {
    icon: Calendar,
    title: 'Smart booking management',
    description: 'Automate availability, confirmations, and no-show handling in minutes.'
  },
  {
    icon: CreditCard,
    title: 'Payments tracking',
    description: 'Track revenue, refunds, and payouts with finance-grade transparency.'
  },
  {
    icon: Globe,
    title: 'Calendar integrations',
    description: 'Sync with external calendars to avoid conflicts and double-bookings.'
  },
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    description: 'Control permissions across admins, staff, and support teams.'
  },
  {
    icon: BarChart3,
    title: 'Analytics dashboard',
    description: 'Turn booking data into growth insights and conversion improvements.'
  }
];

export const HOME_STEPS: HomeStepItem[] = [
  {
    title: 'Create account',
    description: 'Launch your workspace and invite your first team members.'
  },
  {
    title: 'Setup tenant/business',
    description: 'Configure locations, services, staff schedules, and branding.'
  },
  {
    title: 'Manage bookings',
    description: 'Handle customer reservations, reminders, and updates effortlessly.'
  },
  {
    title: 'Track growth',
    description: 'Use real-time analytics to improve occupancy and retention.'
  }
];

export const HOME_TESTIMONIALS: HomeTestimonial[] = [
  {
    name: 'Ayesha Khan',
    role: 'Operations Lead, Lumina Clinics',
    quote:
      'V-omnix cut our booking admin time by 42% in the first month and gave our team full visibility.'
  },
  {
    name: 'Marcus Reed',
    role: 'Founder, FlexFit Studios',
    quote:
      'The multi-tenant model made expansion simple. We launched two new branches in one sprint.'
  },
  {
    name: 'Noah Ibrahim',
    role: 'Head of Growth, NailHaus',
    quote:
      'The analytics dashboard helped us improve conversion from demo to paid by 28%.'
  }
];

export const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    question: 'Can I manage multiple locations under one account?',
    answer:
      'Yes. Orbit is multi-tenant by design, so each location can run independently while sharing central reporting.'
  },
  {
    question: 'Does Orbit support online payments?',
    answer:
      'Yes. You can collect deposits and full payments, then track payout status directly from the dashboard.'
  },
  {
    question: 'Is there onboarding support for my team?',
    answer:
      'All plans include onboarding resources. Silver and Gold include guided setup and migration support.'
  },
  {
    question: 'Can I switch plans later?',
    answer:
      'Absolutely. You can upgrade or downgrade at any time, and your tenant data remains intact.'
  }
];

export const HOME_SOCIAL_LINKS: HomeSocialLink[] = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' }
];

export const HOME_SHOWCASE_SLIDES: HomeShowcaseSlide[] = [
  {
    title: 'Centralized multi-tenant command center',
    description: 'Manage locations, teams, and schedules from one clean real-time workspace.',
    kpi: '12',
    kpiLabel: 'Active branches',
    backgroundClass: 'slide-bg-one'
  },
  {
    title: 'Booking pipeline that converts faster',
    description: 'Track drop-offs and optimize your booking journey with instant funnel visibility.',
    kpi: '31%',
    kpiLabel: 'Conversion uplift',
    backgroundClass: 'slide-bg-two'
  },
  {
    title: 'Operations intelligence at a glance',
    description: 'Surface occupancy, no-show patterns, and revenue health in one executive view.',
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
