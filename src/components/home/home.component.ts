import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ArrowLeft,
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
  Menu,
  Moon,
  PlayCircle,
  ShieldCheck,
  Sun,
  Twitter,
  Users,
  X,
  Zap,
  LucideIconData,
  Eye,
  EyeOff,
  UploadCloud,
  Sparkles
} from 'lucide-angular';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
  id: string;
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

interface ShowcaseSlide {
  title: string;
  description: string;
  kpi: string;
  kpiLabel: string;
  backgroundClass: string;
}

interface CountryCodeOption {
  name: string;
  dialCode: string;
  flag: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  @ViewChildren('revealEl') revealElements!: QueryList<ElementRef<HTMLElement>>;

  annual = false;
  isDarkMode = false;
  mobileMenuOpen = false;
  openFaqIndex: number | null = 0;
  countersStarted = false;
  showAuthChoiceModal = false;
  showAuthPanel = false;
  authMode: 'login' | 'register' = 'login';
  selectedPlanId = 'starter';
  selectedPlanName = 'Starter';
  showLoginPassword = false;
  showRegisterPassword = false;
  authSubmitting = false;
  authError = '';
  onboardingRequired = true;
  profileImagePreview = '';
  isDragOver = false;
  readonly countryCodes: CountryCodeOption[] = [
    { name: 'United States', dialCode: '+1', flag: '🇺🇸' },
    { name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
    { name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
    { name: 'India', dialCode: '+91', flag: '🇮🇳' },
    { name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' }
  ];
  private userThemePreference = false;
  private revealObserver?: IntersectionObserver;
  private statsObserver?: IntersectionObserver;
  private revealFallbackTimer?: ReturnType<typeof setTimeout>;
  private readonly themeStorageKey = 'v-omnix-theme';

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
      id: 'starter',
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
      id: 'silver',
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
      id: 'gold',
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

  readonly showcaseSlides: ShowcaseSlide[] = [
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
  activeShowcaseSlide = 0;

  readonly sunIcon = Sun;
  readonly moonIcon = Moon;
  readonly menuIcon = Menu;
  readonly arrowLeftIcon = ArrowLeft;
  readonly arrowRightIcon = ArrowRight;
  readonly playCircleIcon = PlayCircle;
  readonly usersIcon = Users;
  readonly shieldCheckIcon = ShieldCheck;
  readonly zapIcon = Zap;
  readonly layersIcon = Layers3;
  readonly checkIcon = Check;
  readonly xIcon = X;
  readonly chevronDownIcon = ChevronDown;
  readonly eyeIcon = Eye;
  readonly eyeOffIcon = EyeOff;
  readonly uploadCloudIcon = UploadCloud;
  readonly sparklesIcon = Sparkles;

  readonly loginForm = this.fb.nonNullable.group({
    emailOrMobile: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  readonly registerForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(30)]],
    lastName: ['', [Validators.required, Validators.maxLength(30)]],
    countryCode: [this.countryCodes[2].dialCode, [Validators.required]],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{7,14}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    acceptTerms: [false, [Validators.requiredTrue]],
    profileImage: [null as File | null]
  });

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
    if (this.revealFallbackTimer) {
      clearTimeout(this.revealFallbackTimer);
    }
  }

  toggleTheme(): void {
    this.userThemePreference = true;
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme(this.isDarkMode);
    localStorage.setItem(this.themeStorageKey, this.isDarkMode ? 'dark' : 'light');
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleBillingCycle(isAnnual: boolean): void {
    this.annual = isAnnual;
  }

  openAuthChoice(plan?: PricingPlan): void {
    if (plan) {
      this.selectedPlanId = plan.id;
      this.selectedPlanName = plan.name;
    }
    this.showAuthChoiceModal = true;
    this.showAuthPanel = false;
    this.authError = '';
  }

  openAuthPanel(mode: 'login' | 'register'): void {
    this.authMode = mode;
    this.showAuthChoiceModal = false;
    this.showAuthPanel = true;
    this.authError = '';
  }

  closeAuthOverlays(): void {
    this.showAuthChoiceModal = false;
    this.showAuthPanel = false;
    this.authError = '';
    this.isDragOver = false;
    this.refreshRevealAnimations();
  }

  switchAuthMode(mode: 'login' | 'register'): void {
    this.authMode = mode;
    this.authError = '';
  }

  togglePasswordVisibility(type: 'login' | 'register'): void {
    if (type === 'login') {
      this.showLoginPassword = !this.showLoginPassword;
      return;
    }
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  onProfileFilePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.applyProfileImage(file);
  }

  onUploadDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onUploadDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onUploadDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (!file) {
      return;
    }
    this.applyProfileImage(file);
  }

  async submitAuth(): Promise<void> {
    const targetForm = this.authMode === 'login' ? this.loginForm : this.registerForm;
    if (targetForm.invalid || this.authSubmitting) {
      targetForm.markAllAsTouched();
      return;
    }

    this.authSubmitting = true;
    this.authError = '';

    await new Promise((resolve) => setTimeout(resolve, 900));

    this.authSubmitting = false;
    this.closeAuthOverlays();
    this.router.navigate(['/admin/dashboard'], {
      queryParams: {
        planId: this.selectedPlanId,
        setupIncomplete: this.onboardingRequired ? '1' : '0'
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.showAuthChoiceModal || this.showAuthPanel) {
      this.closeAuthOverlays();
    }
  }

  hasLoginError(controlName: 'emailOrMobile' | 'password'): boolean {
    const control = this.loginForm.controls[controlName];
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasRegisterError(
    controlName:
      | 'firstName'
      | 'lastName'
      | 'countryCode'
      | 'mobileNumber'
      | 'email'
      | 'password'
      | 'acceptTerms'
      | 'profileImage'
  ): boolean {
    const control = this.registerForm.controls[controlName];
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  toggleFaq(index: number): void {
    this.openFaqIndex = this.openFaqIndex === index ? null : index;
  }

  nextShowcaseSlide(): void {
    this.activeShowcaseSlide = (this.activeShowcaseSlide + 1) % this.showcaseSlides.length;
  }

  prevShowcaseSlide(): void {
    this.activeShowcaseSlide =
      (this.activeShowcaseSlide - 1 + this.showcaseSlides.length) % this.showcaseSlides.length;
  }

  setShowcaseSlide(index: number): void {
    this.activeShowcaseSlide = index;
  }

  isFaqOpen(index: number): boolean {
    return this.openFaqIndex === index;
  }

  trackByIndex(index: number): number {
    return index;
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.themeStorageKey);
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
    if (typeof IntersectionObserver === 'undefined') {
      this.forceShowAllRevealSections();
      return;
    }

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.revealObserver?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.25, rootMargin: '0px 0px -5% 0px' }
    );

    this.revealElements.forEach((item) => this.revealObserver?.observe(item.nativeElement));

    this.revealElements.changes.subscribe((elements: QueryList<ElementRef<HTMLElement>>) => {
      elements.forEach((item) => this.revealObserver?.observe(item.nativeElement));
    });

    // Refresh/load safety: only reveal items that should already be on screen.
    this.revealFallbackTimer = setTimeout(() => {
      this.forceShowVisibleRevealSections();
    }, 1400);
  }

  private forceShowAllRevealSections(): void {
    this.revealElements.forEach((item) => item.nativeElement.classList.add('is-visible'));
  }

  private forceShowVisibleRevealSections(): void {
    const viewportLimit = window.innerHeight * 0.9;
    this.revealElements.forEach((item) => {
      const rect = item.nativeElement.getBoundingClientRect();
      if (rect.top <= viewportLimit) {
        item.nativeElement.classList.add('is-visible');
      }
    });
  }

  private refreshRevealAnimations(): void {
    // Re-check reveal elements after modal close so sections do not remain hidden.
    this.forceShowVisibleRevealSections();
    setTimeout(() => {
      this.forceShowVisibleRevealSections();
      this.revealElements.forEach((item) => {
        const element = item.nativeElement;
        if (!element.classList.contains('is-visible')) {
          this.revealObserver?.observe(element);
        }
      });
    }, 90);
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

  private applyProfileImage(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.authError = 'Please upload a valid image file.';
      return;
    }
    this.registerForm.patchValue({ profileImage: file });
    const reader = new FileReader();
    reader.onload = () => {
      this.profileImagePreview = typeof reader.result === 'string' ? reader.result : '';
    };
    reader.readAsDataURL(file);
  }
}
