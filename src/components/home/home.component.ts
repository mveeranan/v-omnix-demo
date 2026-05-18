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
  Lock,
  Mail,
  Phone,
  Sparkles,
  Upload,
  User
} from 'lucide-angular';
import { HttpClient } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '../../environments/api.constants';
import { AuthService } from '../../app/core/auth/auth.service';
import { NotificationService } from '../../app/core/notifications/notification.service';
import { firstValueFrom, Subscription } from 'rxjs';

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
  id?: string;
  name: string;
  included: boolean;
}

interface PlanPrice {
  planPriceId: string;
  billingCycle: 'Monthly' | 'Yearly' | string;
  amount: number;
  currency: string;
  stripePriceId: string;
}

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice?: PlanPrice;
  annualPrice?: PlanPrice;
  description: string;
  popular?: boolean;
  features: PricingFeature[];
}

interface PlanApiDto {
  planId: string;
  name: string;
  prices: PlanPrice[];
  features: Array<{
    id: string;
    name: string;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

interface AuthContext {
  tenantId: string;
  tenantName: string;
  roleId: string;
  roleName: string;
}

interface LoginData {
  token: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  email: string;
  contexts: AuthContext[];
}

interface SelectContextData {
  userId: string;
  email: string;
  tenantId: string;
  tenantName: string;
  roleId: string;
  roleName: string;
}

interface RegisterData {
  tenantId: string;
}

interface CheckoutSessionResponse {
  checkoutUrl: string;
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
  id?: string;
  name: string;
  isoCode?: string;
  dialCode: string;
  flagEmoji: string;
  phoneNumberRegex?: string;
  phoneNumberExample?: string;
  nationalNumberMinLength?: number;
  nationalNumberMaxLength?: number;
}

enum BusinessType {
  Salon = 1,
  Spa,
  Studio,
  Clinic,
  Freelancer,
  Other
}

enum FileCategory {
  Unknown = 0,
  ProfileImage = 1,
  BusinessLogo = 2,
  PortfolioImage = 3,
  PortfolioVideo = 4,
  BookingAttachment = 5,
  InvoiceDocument = 6,
  IdentityVerification = 7,
  ChatAttachment = 8,
  BannerImage = 9
}

interface UploadDocumentFile {
  fileName: string;
  contentType: string;
  base64Content: string;
}

interface UploadDocumentRequest {
  files: UploadDocumentFile[];
  fileCategory: FileCategory;
  tenantId?: string;
}

interface BusinessTypeOption {
  value: BusinessType;
  label: string;
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
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  @ViewChildren('revealEl') revealElements!: QueryList<ElementRef<HTMLElement>>;

  annual = false;
  isDarkMode = false;
  mobileMenuOpen = false;
  openFaqIndex: number | null = 0;
  countersStarted = false;
  showAuthChoiceModal = false;
  showLoginPanel = false;
  showRegisterPanel = false;
  readonly registerTotalSteps = 4;
  readonly registerSteps = [1, 2, 3, 4];
  selectedPlanId = '';
  selectedPlanName = '';
  selectedPlanPriceId = '';
  selectedStripePriceId = '';
  pricingLoading = false;
  pricingError = '';
  showLoginPassword = false;
  showRegisterPassword = false;
  registerStep = 1;
  authSubmitting = false;
  authError = '';
  onboardingRequired = true;
  showContextSelectionModal = false;
  contextSubmitting = false;
  contextError = '';
  loginUserId = '';
  loginUserEmail = '';
  availableContexts: AuthContext[] = [];
  selectedContextTenantId = '';
  businessLogoFile: File | null = null;
  businessLogoPreview: string | null = null;
  isCountryDropdownOpen = false;
  countrySearchTerm = '';
  countryOptions: CountryCodeOption[] = [];
  countriesLoading = false;
  countriesError = '';
  private userThemePreference = false;
  private revealObserver?: IntersectionObserver;
  private statsObserver?: IntersectionObserver;
  private revealFallbackTimer?: ReturnType<typeof setTimeout>;
  private readonly themeStorageKey = 'v-omnix-theme';
  private countryCodeSubscription?: Subscription;
  readonly businessTypeOptions: BusinessTypeOption[] = [
    { value: BusinessType.Salon, label: 'Salon' },
    { value: BusinessType.Spa, label: 'Spa' },
    { value: BusinessType.Studio, label: 'Studio' },
    { value: BusinessType.Clinic, label: 'Clinic' },
    { value: BusinessType.Freelancer, label: 'Freelancer' },
    { value: BusinessType.Other, label: 'Other' }
  ];

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

  pricingPlans: PricingPlan[] = [];

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
  readonly sparklesIcon = Sparkles;
  readonly uploadIcon = Upload;
  readonly mailIcon = Mail;
  readonly lockIcon = Lock;
  readonly userIcon = User;
  readonly phoneIcon = Phone;
  readonly globeIcon = Globe;
  readonly buildingIcon = Building2;

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  readonly registerForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(30)]],
    lastName: ['', [Validators.required, Validators.maxLength(30)]],
    countryCode: ['', [Validators.required]],
    mobileNumber: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    businessName: ['', [Validators.required, Validators.maxLength(80)]],
    businessType: [0 as number, [Validators.required, Validators.min(1)]],
    description: [''],
    acceptTerms: [false, [Validators.requiredTrue]]
  });

  ngOnInit(): void {
    this.initializeTheme();
    this.loadPricingPlans();
    this.setupCountryValidationWatcher();
    this.loadCountries();
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
    this.countryCodeSubscription?.unsubscribe();
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

  openAuthChoice(plan: PricingPlan): void {
    this.selectedPlanId = plan.id;
    this.selectedPlanName = plan.name;
    const selectedPrice = this.getPlanPrice(plan);
    this.selectedPlanPriceId = selectedPrice?.planPriceId ?? '';
    this.selectedStripePriceId = selectedPrice?.stripePriceId ?? '';
    this.showAuthChoiceModal = true;
    this.showLoginPanel = false;
    this.showRegisterPanel = false;
    this.authError = '';
    this.syncBodyScrollLock();
  }

  openLoginPanel(): void {
    this.showAuthChoiceModal = false;
    this.showRegisterPanel = false;
    this.showLoginPanel = true;
    this.authError = '';
    this.syncBodyScrollLock();
  }

  openRegisterPanel(): void {
    this.showAuthChoiceModal = false;
    this.showLoginPanel = false;
    this.showRegisterPanel = true;
    this.registerStep = 1;
    this.authError = '';
    this.syncBodyScrollLock();
  }

  closeAuthOverlays(): void {
    this.showAuthChoiceModal = false;
    this.showLoginPanel = false;
    this.showRegisterPanel = false;
    this.showContextSelectionModal = false;
    this.authError = '';
    this.contextError = '';
    this.resetAuthForms();
    this.refreshRevealAnimations();
    this.syncBodyScrollLock();
  }

  private syncBodyScrollLock(): void {
    if (typeof document === 'undefined') {
      return;
    }
    const shouldLock =
      this.showAuthChoiceModal ||
      this.showLoginPanel ||
      this.showRegisterPanel ||
      this.showContextSelectionModal;
    document.body.style.overflow = shouldLock ? 'hidden' : '';
  }

  private resetAuthForms(): void {
    this.authSubmitting = false;
    this.contextSubmitting = false;

    this.loginForm.reset({
      email: '',
      password: ''
    });

    const preferredDial =
      this.countryOptions.find((item) => item.dialCode === '+971')?.dialCode ??
      this.countryOptions[0]?.dialCode ??
      '';

    this.registerForm.reset({
      firstName: '',
      lastName: '',
      countryCode: preferredDial,
      mobileNumber: '',
      email: '',
      password: '',
      businessName: '',
      businessType: 0,
      description: '',
      acceptTerms: false
    });
    this.applyCountryValidators();

    this.removeLogoFile();
    this.registerStep = 1;
    this.showLoginPassword = false;
    this.showRegisterPassword = false;
    this.isCountryDropdownOpen = false;
    this.countrySearchTerm = '';

    this.loginUserId = '';
    this.loginUserEmail = '';
    this.availableContexts = [];
    this.selectedContextTenantId = '';
  }

  togglePasswordVisibility(type: 'login' | 'register'): void {
    if (type === 'login') {
      this.showLoginPassword = !this.showLoginPassword;
      return;
    }
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  async submitLoginForm(): Promise<void> {
    if (this.authSubmitting) {
      return;
    }
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authSubmitting = true;
    this.authError = '';

    try {
      const payload = {
        email: this.loginForm.controls.email.value.trim(),
        password: this.loginForm.controls.password.value
      };
      const response = await firstValueFrom(
        this.http.post<ApiResponse<LoginData>>(API_ENDPOINTS.auth.login, payload)
      );
      if (!response.success || !response.data?.token) {
        this.authError = response.message || this.getFirstError(response.errors) || 'Login failed.';
        this.notificationService.error(this.authError);
        this.authSubmitting = false;
        return;
      }

      this.authService.setTokens({
        accessToken: response.data.token,
        refreshToken: response.data.refreshToken ?? ''
      });

      this.loginUserId = response.data.userId;
      this.loginUserEmail = response.data.email;
      this.availableContexts = response.data.contexts ?? [];

      if (this.availableContexts.length === 0) {
        this.authSubmitting = false;
        this.authError = 'No tenant context is assigned for this account.';
        this.notificationService.warning(this.authError);
        return;
      }

      if (this.availableContexts.length > 1) {
        this.showLoginPanel = false;
        this.showContextSelectionModal = true;
        this.syncBodyScrollLock();
        this.selectedContextTenantId = this.availableContexts[0]?.tenantId ?? '';
        this.notificationService.info('Multiple contexts found. Select one to continue.');
        this.authSubmitting = false;
        return;
      }

      this.authSubmitting = false;
      this.notificationService.success('Login successful.');
      this.navigateToDashboard(false);
    } catch (error) {
      this.authSubmitting = false;
      this.authError = this.extractErrorMessage(error) || 'Login failed. Please try again.';
      this.notificationService.error(this.authError);
    }
  }

  selectContext(tenantId: string): void {
    this.selectedContextTenantId = tenantId;
    this.contextError = '';
  }

  async continueWithSelectedContext(): Promise<void> {
    if (!this.selectedContextTenantId || !this.loginUserId || this.contextSubmitting) {
      return;
    }

    this.contextSubmitting = true;
    this.contextError = '';

    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<SelectContextData>>(API_ENDPOINTS.auth.selectContext, {
          userId: this.loginUserId,
          tenantId: this.selectedContextTenantId
        })
      );

      if (!response.success) {
        this.contextSubmitting = false;
        this.contextError =
          response.message || this.getFirstError(response.errors) || 'Context selection failed.';
        this.notificationService.error(this.contextError);
        return;
      }

      this.contextSubmitting = false;
      this.notificationService.success('Context selected successfully.');
      this.closeAuthOverlays();
      this.navigateToDashboard(false);
    } catch (error) {
      this.contextSubmitting = false;
      this.contextError =
        this.extractErrorMessage(error) || 'Unable to select context. Please try again.';
      this.notificationService.error(this.contextError);
    }
  }

  cancelContextSelection(): void {
    this.showContextSelectionModal = false;
    this.showLoginPanel = true;
    this.contextError = '';
    this.syncBodyScrollLock();
  }

  onRegisterFormSubmit(event: Event): void {
    event.preventDefault();
    if (this.registerStep < this.registerTotalSteps) {
      this.tryAdvanceRegisterStep();
      return;
    }
    void this.submitRegisterForm();
  }

  goToRegisterNextStep(): void {
    this.tryAdvanceRegisterStep();
  }

  async submitRegisterForm(): Promise<void> {
    if (this.authSubmitting) {
      return;
    }

    this.authSubmitting = true;
    this.authError = '';
    await this.submitRegister();
  }

  getContextContinueText(context: AuthContext): string {
    return `Continue with ${context.tenantName} (${context.roleName}) - ${this.loginUserEmail}`;
  }

  getMobileNumberError(): string {
    const control = this.registerForm.controls.mobileNumber;
    if (!(control.invalid && (control.dirty || control.touched))) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Mobile number is required.';
    }

    const selectedCountry = this.getSelectedCountry();
    const minLength = selectedCountry?.nationalNumberMinLength;
    const maxLength = selectedCountry?.nationalNumberMaxLength;

    if ((control.hasError('minlength') || control.hasError('mobileLength')) && minLength) {
      return `Mobile number must be at least ${minLength} digits.`;
    }

    if ((control.hasError('maxlength') || control.hasError('mobileLength')) && maxLength) {
      return `Mobile number must be at most ${maxLength} digits.`;
    }

    if (control.hasError('pattern') || control.hasError('mobilePattern')) {
      if (selectedCountry?.phoneNumberExample) {
        return `Invalid format. Example: ${selectedCountry.phoneNumberExample}`;
      }
      return 'Invalid mobile number format.';
    }

    return 'Invalid mobile number.';
  }

  getRegisterFieldError(
    controlName:
      | 'firstName'
      | 'lastName'
      | 'countryCode'
      | 'businessName'
      | 'businessType'
      | 'email'
      | 'password'
      | 'acceptTerms'
  ): string {
    const control = this.registerForm.controls[controlName];
    if (!(control.invalid && (control.dirty || control.touched))) {
      return '';
    }

    if (control.hasError('required')) {
      if (controlName === 'firstName') {
        return 'First name is required.';
      }
      if (controlName === 'lastName') {
        return 'Last name is required.';
      }
      if (controlName === 'countryCode') {
        return 'Country code is required.';
      }
      if (controlName === 'email') {
        return 'Email address is required.';
      }
      if (controlName === 'password') {
        return 'Password is required.';
      }
      if (controlName === 'businessName') {
        return 'Business name is required.';
      }
      if (controlName === 'businessType') {
        return 'Business type is required.';
      }
    }

    if (control.hasError('email')) {
      return 'Enter a valid email address.';
    }

    if (control.hasError('minlength') && controlName === 'password') {
      return 'Password must be at least 8 characters.';
    }

    if (control.hasError('maxlength') && (controlName === 'firstName' || controlName === 'lastName')) {
      return 'Maximum 30 characters allowed.';
    }

    if (control.hasError('maxlength') && controlName === 'businessName') {
      return 'Maximum 80 characters allowed.';
    }

    if (controlName === 'businessType' && control.hasError('min')) {
      return 'Business type is required.';
    }

    if (controlName === 'acceptTerms' && control.hasError('requiredTrue')) {
      return 'Please accept terms to continue.';
    }

    return 'This field is required.';
  }

  getRegisterStepLabel(step: number): string {
    const labels = ['Personal info', 'Account', 'Business', 'Bio'];
    return labels[step - 1] ?? '';
  }

  getRegisterStepSubtitle(): string {
    const subtitles = [
      'Enter your name and mobile number.',
      'Set your email, password, and accept the terms.',
      'Enter your business name and type.',
      'Add an optional description and logo.'
    ];
    return subtitles[this.registerStep - 1] ?? '';
  }

  isRegisterStepComplete(step: number): boolean {
    return step < this.registerStep;
  }

  isRegisterStepActive(step: number): boolean {
    return step === this.registerStep;
  }

  canProceedRegisterStep(step: number): boolean {
    switch (step) {
      case 1:
        return (
          this.registerForm.controls.firstName.valid &&
          this.registerForm.controls.lastName.valid &&
          this.registerForm.controls.countryCode.valid &&
          this.registerForm.controls.mobileNumber.valid
        );
      case 2:
        return (
          this.registerForm.controls.email.valid &&
          this.registerForm.controls.password.valid &&
          this.registerForm.controls.acceptTerms.valid
        );
      case 3:
        return (
          this.registerForm.controls.businessName.valid &&
          this.registerForm.controls.businessType.valid
        );
      case 4:
        return true;
      default:
        return false;
    }
  }

  tryAdvanceRegisterStep(): void {
    if (!this.canProceedRegisterStep(this.registerStep)) {
      this.markRegisterStepTouched(this.registerStep);
      this.notificationService.warning('Please complete the required fields on this step.');
      return;
    }
    if (this.registerStep < this.registerTotalSteps) {
      this.registerStep += 1;
    }
  }

  goToRegisterPrevStep(): void {
    if (this.registerStep > 1) {
      this.registerStep -= 1;
    }
  }

  private markRegisterStepTouched(step: number): void {
    switch (step) {
      case 1:
        this.registerForm.controls.firstName.markAsTouched();
        this.registerForm.controls.lastName.markAsTouched();
        this.registerForm.controls.countryCode.markAsTouched();
        this.registerForm.controls.mobileNumber.markAsTouched();
        break;
      case 2:
        this.registerForm.controls.email.markAsTouched();
        this.registerForm.controls.password.markAsTouched();
        this.registerForm.controls.acceptTerms.markAsTouched();
        break;
      case 3:
        this.registerForm.controls.businessName.markAsTouched();
        this.registerForm.controls.businessType.markAsTouched();
        break;
    }
  }

  getSelectedCountryLabel(): string {
    const selectedCountry = this.getSelectedCountry();
    if (!selectedCountry) {
      return 'Select country code';
    }
    return `${selectedCountry.name} (${selectedCountry.dialCode})`;
  }

  getFilteredCountryOptions(): CountryCodeOption[] {
    const search = this.countrySearchTerm.trim().toLowerCase();
    if (!search) {
      return this.countryOptions;
    }
    return this.countryOptions.filter(
      (country) =>
        country.name.toLowerCase().includes(search) || country.dialCode.toLowerCase().includes(search)
    );
  }

  toggleCountryDropdown(): void {
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
    if (this.isCountryDropdownOpen) {
      this.countrySearchTerm = '';
    }
  }

  onCountrySearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.countrySearchTerm = input.value;
  }

  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      this.notificationService.warning('Please upload a PNG, JPG, WebP, or SVG image.');
      input.value = '';
      return;
    }

    const maxSizeMB = 2;
    if (file.size > maxSizeMB * 1024 * 1024) {
      this.notificationService.warning(`Logo must be under ${maxSizeMB} MB.`);
      input.value = '';
      return;
    }

    this.businessLogoFile = file;
    this.businessLogoPreview = URL.createObjectURL(file);
  }

  removeLogoFile(): void {
    if (this.businessLogoPreview) {
      URL.revokeObjectURL(this.businessLogoPreview);
    }
    this.businessLogoFile = null;
    this.businessLogoPreview = null;
  }

  selectCountryOption(country: CountryCodeOption): void {
    this.registerForm.controls.countryCode.setValue(country.dialCode);
    this.registerForm.controls.countryCode.markAsTouched();
    this.isCountryDropdownOpen = false;
    this.countrySearchTerm = '';
    this.applyCountryValidators();
  }

  private navigateToDashboard(includeSetupState: boolean): void {
    this.closeAuthOverlays();
    const queryParams: Record<string, string> = {
      planId: this.selectedPlanId,
      planPriceId: this.selectedPlanPriceId,
      stripePriceId: this.selectedStripePriceId
    };
    if (includeSetupState) {
      queryParams['setupIncomplete'] = this.onboardingRequired ? '1' : '0';
    }
    this.router.navigate(['/admin/dashboard'], {
      queryParams
    });
  }

  private async submitRegister(): Promise<void> {
    try {
      const selectedCountry = this.getSelectedCountry();
      if (!selectedCountry) {
        this.authSubmitting = false;
        this.authError = 'Please select a country code.';
        this.notificationService.warning(this.authError);
        return;
      }

      const nationalNumber = this.registerForm.controls.mobileNumber.value.trim();
      const description = this.registerForm.controls.description.value.trim();

      const payload: Record<string, unknown> = {
        firstName: this.registerForm.controls.firstName.value.trim(),
        lastName: this.registerForm.controls.lastName.value.trim(),
        email: this.registerForm.controls.email.value.trim(),
        password: this.registerForm.controls.password.value,
        businessName: this.registerForm.controls.businessName.value.trim(),
        businessType: this.registerForm.controls.businessType.value,
        mobileNumber: `${selectedCountry.dialCode} ${nationalNumber}`
      };

      if (description) {
        payload['description'] = description;
      }
      if (this.selectedPlanName) {
        payload['planName'] = this.selectedPlanName;
      }

      if (this.businessLogoFile) {
        const base64Content = await this.fileToBase64(this.businessLogoFile);
        const attachments: UploadDocumentRequest = {
          files: [{
            fileName: this.businessLogoFile.name,
            contentType: this.businessLogoFile.type,
            base64Content
          }],
          fileCategory: FileCategory.BusinessLogo
        };
        payload['attachments'] = attachments;
      }

      const response = await firstValueFrom(
        this.http.post<ApiResponse<RegisterData>>(API_ENDPOINTS.auth.registerAdmin, payload)
      );

      if (!response.success) {
        this.authSubmitting = false;
        this.authError = response.message || this.getFirstError(response.errors) || 'Registration failed.';
        this.notificationService.error(this.authError);
        return;
      }

      const tenantId = response.data?.tenantId;
      if (!tenantId) {
        this.authSubmitting = false;
        this.authError = 'Account created but no tenant was returned. Please contact support.';
        this.notificationService.error(this.authError);
        return;
      }

      this.notificationService.success(response.message || 'Account created successfully.');

      if (this.selectedPlanPriceId) {
        await this.initiateStripeCheckout(tenantId, this.selectedPlanPriceId);
      } else {
        this.authSubmitting = false;
        this.navigateToDashboard(false);
      }
    } catch (error) {
      this.authSubmitting = false;
      this.authError = this.extractErrorMessage(error) || 'Registration failed. Please try again.';
      this.notificationService.error(this.authError);
    }
  }

  private async initiateStripeCheckout(tenantId: string, planPriceId: string): Promise<void> {
    try {
      this.notificationService.info('Redirecting to payment...');

      const checkoutResponse = await firstValueFrom(
        this.http.post<ApiResponse<CheckoutSessionResponse>>(API_ENDPOINTS.stripe.checkout, {
          planPriceId,
          tenantId
        })
      );

      if (!checkoutResponse.success || !checkoutResponse.data?.checkoutUrl) {
        this.authSubmitting = false;
        this.authError =
          checkoutResponse.message ||
          this.getFirstError(checkoutResponse.errors) ||
          'Unable to create checkout session. Please try again.';
        this.notificationService.error(this.authError);
        return;
      }

      this.authSubmitting = false;
      window.location.href = checkoutResponse.data.checkoutUrl;
    } catch (error) {
      this.authSubmitting = false;
      this.authError =
        this.extractErrorMessage(error) || 'Payment setup failed. Please try again.';
      this.notificationService.error(this.authError);
    }
  }

  private setupCountryValidationWatcher(): void {
    this.countryCodeSubscription = this.registerForm.controls.countryCode.valueChanges.subscribe(() => {
      this.applyCountryValidators();
    });
  }

  private async loadCountries(): Promise<void> {
    this.countriesLoading = true;
    this.countriesError = '';

    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<CountryCodeOption[]>>(API_ENDPOINTS.countries.list)
      );
      if (!response.success || !Array.isArray(response.data) || response.data.length === 0) {
        this.countriesLoading = false;
        this.countriesError = response.message || 'Unable to load countries.';
        return;
      }

      this.countryOptions = response.data;
      const preferred = response.data.find((item) => item.dialCode === '+971') ?? response.data[0];
      this.registerForm.controls.countryCode.setValue(preferred.dialCode);
      this.applyCountryValidators();
      this.countriesLoading = false;
    } catch {
      this.countriesLoading = false;
      this.countriesError = 'Unable to load countries.';
    }
  }

  private applyCountryValidators(): void {
    const selectedCountry = this.getSelectedCountry();
    const validators: ValidatorFn[] = [Validators.required];

    if (selectedCountry?.nationalNumberMinLength) {
      validators.push(Validators.minLength(selectedCountry.nationalNumberMinLength));
    }
    if (selectedCountry?.nationalNumberMaxLength) {
      validators.push(Validators.maxLength(selectedCountry.nationalNumberMaxLength));
    }
    if (selectedCountry?.phoneNumberRegex) {
      try {
        validators.push(Validators.pattern(new RegExp(selectedCountry.phoneNumberRegex)));
      } catch {
        // Ignore malformed regex from backend and continue with length validation.
      }
    }

    validators.push(this.mobileDigitsValidator(selectedCountry));
    this.registerForm.controls.mobileNumber.setValidators(validators);
    this.registerForm.controls.mobileNumber.updateValueAndValidity({ emitEvent: false });
  }

  private mobileDigitsValidator(country?: CountryCodeOption): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = typeof control.value === 'string' ? control.value.trim() : '';
      if (!value) {
        return null;
      }
      if (!/^\d+$/.test(value)) {
        return { mobilePattern: true };
      }
      if (country?.nationalNumberMinLength && value.length < country.nationalNumberMinLength) {
        return { mobileLength: true };
      }
      if (country?.nationalNumberMaxLength && value.length > country.nationalNumberMaxLength) {
        return { mobileLength: true };
      }
      return null;
    };
  }

  private getSelectedCountry(): CountryCodeOption | undefined {
    const selectedDialCode = this.registerForm.controls.countryCode.value;
    return this.countryOptions.find((option) => option.dialCode === selectedDialCode);
  }


  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.isCountryDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.country-picker-shell')) {
      this.isCountryDropdownOpen = false;
    }
  }

  hasLoginError(controlName: 'email' | 'password'): boolean {
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

  getPlanPrice(plan: PricingPlan): PlanPrice | undefined {
    return this.annual ? plan.annualPrice : plan.monthlyPrice;
  }

  getDisplayPrice(plan: PricingPlan): string {
    const price = this.getPlanPrice(plan);
    if (!price) {
      return '--';
    }
    return Number.isInteger(price.amount) ? price.amount.toString() : price.amount.toFixed(2);
  }

  getDisplayCurrency(plan: PricingPlan): string {
    const price = this.getPlanPrice(plan);
    return price?.currency ?? 'USD';
  }

  private loadPricingPlans(): void {
    this.pricingLoading = true;
    this.pricingError = '';

    this.http.get<ApiResponse<PlanApiDto[]>>(API_ENDPOINTS.plans.list).subscribe({
      next: (response) => {
        if (!response.success || !Array.isArray(response.data)) {
          this.pricingError = response.message || 'Unable to load pricing plans right now.';
          this.pricingLoading = false;
          return;
        }

        const mappedPlans = response.data.map((plan, index) => this.mapApiPlan(plan, index));
        if (mappedPlans.length > 0) {
          this.pricingPlans = mappedPlans;
          const defaultPlan = mappedPlans[0];
          this.selectedPlanId = defaultPlan.id;
          this.selectedPlanName = defaultPlan.name;
          const selectedPrice = this.getPlanPrice(defaultPlan);
          this.selectedPlanPriceId = selectedPrice?.planPriceId ?? '';
          this.selectedStripePriceId = selectedPrice?.stripePriceId ?? '';
        } else {
          this.pricingPlans = [];
        }
        this.pricingLoading = false;
      },
      error: () => {
        this.pricingError = 'Unable to load pricing plans right now.';
        this.pricingLoading = false;
      }
    });
  }

  private mapApiPlan(plan: PlanApiDto, index: number): PricingPlan {
    const monthlyPrice = plan.prices.find((price) => price.billingCycle === 'Monthly');
    const annualPrice = plan.prices.find((price) => price.billingCycle === 'Yearly');

    return {
      id: plan.planId,
      name: plan.name,
      description: this.buildPlanDescription(plan.name),
      popular: index === 1,
      monthlyPrice,
      annualPrice,
      features: plan.features.map((feature) => ({
        id: feature.id,
        name: feature.name,
        included: true
      }))
    };
  }

  private buildPlanDescription(planName: string): string {
    const normalized = planName.toLowerCase();
    if (normalized.includes('starter')) {
      return 'For early-stage teams launching their first booking workflow.';
    }
    if (normalized.includes('silver') || normalized.includes('growth')) {
      return 'For growing teams scaling operations across locations.';
    }
    if (normalized.includes('gold') || normalized.includes('pro') || normalized.includes('enterprise')) {
      return 'For high-volume operators that need enterprise-grade controls.';
    }
    return 'A scalable plan designed for booking operations growth.';
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private getFirstError(errors?: string[]): string {
    return Array.isArray(errors) && errors.length > 0 ? errors[0] : '';
  }

  private extractErrorMessage(error: unknown): string {
    if (typeof error !== 'object' || !error) {
      return '';
    }
    const httpError = error as {
      error?: { message?: string; errors?: string[] };
      message?: string;
    };
    return (
      httpError.error?.message ||
      this.getFirstError(httpError.error?.errors) ||
      httpError.message ||
      ''
    );
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

}
