import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  CreditCard,
  Github,
  Globe,
  Layers3,
  Linkedin,
  LucideAngularModule,
  Moon,
  PlayCircle,
  ShieldCheck,
  Star,
  Sun,
  Twitter,
  Users,
  X,
  Zap,
  LucideIconData
} from 'lucide-angular';

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  displayValue: number;
}

interface FeatureItem {
  icon: LucideIconData;
  title: string;
  description: string;
}

interface StepItem {
  title: string;
  description: string;
}

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  popular?: boolean;
  features: PricingFeature[];
}

interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface SocialLink {
  icon: LucideIconData;
  label: string;
  href: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
   imports: [LucideAngularModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  @ViewChildren('revealEl') revealElements!: QueryList<ElementRef<HTMLElement>>;

  annual = false;
  isDarkMode = false;
  openFaqIndex: number | null = 0;
  countersStarted = false;
  private userThemePreference = false;
  private revealObserver?: IntersectionObserver;
  private statsObserver?: IntersectionObserver;

  readonly statItems: StatItem[] = [
    { label: 'Businesses', value: 100, suffix: '+', displayValue: 0 },
    { label: 'Bookings', value: 1000, suffix: '+', displayValue: 0 },
    { label: 'Uptime', value: 99.9, suffix: '%', displayValue: 99.9 }
  ];

  readonly featureItems: FeatureItem[] = [
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

  readonly steps: StepItem[] = [
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

  readonly pricingPlans: PricingPlan[] = [
    {
      name: 'Starter',
      monthlyPrice: 29,
      annualPrice: 23,
      description: 'For early-stage teams launching their first booking workflow.',
      features: [
        { name: '1 tenant / business', included: true },
        { name: 'Up to 3 staff accounts', included: true },
        { name: 'Basic booking calendar', included: true },
        { name: 'Payments and invoicing', included: false },
        { name: 'Advanced analytics', included: false }
      ]
    },
    {
      name: 'Silver',
      monthlyPrice: 79,
      annualPrice: 63,
      description: 'For growing teams scaling operations across locations.',
      popular: true,
      features: [
        { name: '5 tenants / businesses', included: true },
        { name: 'Unlimited staff accounts', included: true },
        { name: 'Automations and reminders', included: true },
        { name: 'Payments and invoicing', included: true },
        { name: 'Advanced analytics', included: false }
      ]
    },
    {
      name: 'Gold',
      monthlyPrice: 149,
      annualPrice: 119,
      description: 'For high-volume operators that need enterprise-grade controls.',
      features: [
        { name: 'Unlimited tenants', included: true },
        { name: 'Priority onboarding', included: true },
        { name: 'Role-based access controls', included: true },
        { name: 'Payments and invoicing', included: true },
        { name: 'Advanced analytics', included: true }
      ]
    }
  ];

  readonly testimonials: Testimonial[] = [
    {
      name: 'Ayesha Khan',
      role: 'Operations Lead, Lumina Clinics',
      quote:
        'Orbit cut our booking admin time by 42% in the first month and gave our team full visibility.'
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

  readonly faqItems: FaqItem[] = [
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

  readonly socialLinks: SocialLink[] = [
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
    { icon: Github, label: 'GitHub', href: '#' }
  ];

  readonly sunIcon = Sun;
  readonly moonIcon = Moon;
  readonly arrowRightIcon = ArrowRight;
  readonly playCircleIcon = PlayCircle;
  readonly usersIcon = Users;
  readonly shieldCheckIcon = ShieldCheck;
  readonly zapIcon = Zap;
  readonly layersIcon = Layers3;
  readonly checkIcon = Check;
  readonly xIcon = X;
  readonly chevronDownIcon = ChevronDown;

  ngOnInit(): void {
    this.initializeTheme();
  }

  ngAfterViewInit(): void {
    this.setupRevealObserver();
    this.setupStatsObserver();
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.statsObserver?.disconnect();
  }

  toggleTheme(): void {
    this.userThemePreference = true;
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme(this.isDarkMode);
    localStorage.setItem('orbit-theme', this.isDarkMode ? 'dark' : 'light');
  }

  toggleBillingCycle(isAnnual: boolean): void {
    this.annual = isAnnual;
  }

  toggleFaq(index: number): void {
    this.openFaqIndex = this.openFaqIndex === index ? null : index;
  }

  isFaqOpen(index: number): boolean {
    return this.openFaqIndex === index;
  }

  trackByIndex(index: number): number {
    return index;
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('orbit-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.userThemePreference = true;
      this.isDarkMode = savedTheme === 'dark';
      this.applyTheme(this.isDarkMode);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode = prefersDark;
    this.applyTheme(prefersDark);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      if (this.userThemePreference) {
        return;
      }
      this.isDarkMode = event.matches;
      this.applyTheme(event.matches);
    });
  }

  private applyTheme(isDark: boolean): void {
    document.documentElement.classList.toggle('dark', isDark);
  }

  private setupRevealObserver(): void {
    this.revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.revealObserver?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    this.revealElements.forEach((item) => this.revealObserver?.observe(item.nativeElement));
  }

  private setupStatsObserver(): void {
    const statsSection = document.querySelector('#stats');
    if (!statsSection) {
      return;
    }

    this.statsObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !this.countersStarted) {
          this.countersStarted = true;
          this.animateCounters();
          this.statsObserver?.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    this.statsObserver.observe(statsSection);
  }

  private animateCounters(): void {
    const duration = 1200;
    const start = performance.now();
    const animatable = this.statItems.filter((item) => item.label !== 'Uptime');

    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      animatable.forEach((item) => {
        item.displayValue = Math.floor(item.value * eased);
      });

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }
}
