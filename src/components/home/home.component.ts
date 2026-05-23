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
  Building2,
  Check,
  ChevronDown,
  Globe,
  Layers3,
  LucideAngularModule,
  Menu,
  Moon,
  PlayCircle,
  ShieldCheck,
  Sun,
  Users,
  X,
  Zap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Sparkles,
  Upload,
  User
} from 'lucide-angular';
import {
  createHomeStatItems,
  HOME_FAQ_ITEMS,
  HOME_FEATURE_ITEMS,
  HOME_SHOWCASE_SLIDES,
  HOME_SOCIAL_LINKS,
  HOME_STEPS,
  HOME_TESTIMONIALS
} from './home-marketing.content';
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
import type { AuthContext, LoginData, SelectContextData } from '../../app/core/auth/models/auth.model';
import { ThemeService } from '../../app/core/theme/theme.service';
import { NotificationService } from '../../app/core/notifications/notification.service';
import { firstValueFrom, Subscription } from 'rxjs';

interface PricingFeature {
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

interface RegisterData {
  tenantId: string;
}

interface CheckoutSessionResponse {
  checkoutUrl: string;
}

interface CountryCodeOption {
  id?: string;
  name: string;
  dialCode: string;
  phoneNumberRegex?: string;
  phoneNumberExample?: string;
  nationalNumberMinLength?: number;
  nationalNumberMaxLength?: number;
}

interface BusinessTypeDto {
  id: string;
  name: string;
}

interface BusinessGroupDto {
  groupId: string;
  groupName: string;
  types: BusinessTypeDto[];
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
  private readonly themeService = inject(ThemeService);
  @ViewChildren('revealEl') revealElements!: QueryList<ElementRef<HTMLElement>>;

  annual = false;
  readonly isDark = this.themeService.isDark;
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
  businessGroups: BusinessGroupDto[] = [];
  businessTypesLoading = false;
  businessTypesError = '';
  private revealObserver?: IntersectionObserver;
  private statsObserver?: IntersectionObserver;
  private revealFallbackTimer?: ReturnType<typeof setTimeout>;
  private countryCodeSubscription?: Subscription;

  readonly statItems = createHomeStatItems();
  readonly featureItems = HOME_FEATURE_ITEMS;
  readonly steps = HOME_STEPS;
  readonly testimonials = HOME_TESTIMONIALS;
  readonly faqItems = HOME_FAQ_ITEMS;
  readonly socialLinks = HOME_SOCIAL_LINKS;
  readonly showcaseSlides = HOME_SHOWCASE_SLIDES;

  pricingPlans: PricingPlan[] = [];
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
    businessGroupId: ['', [Validators.required]],
    businessTypeId: ['', [Validators.required]],
    description: [''],
    acceptTerms: [false, [Validators.requiredTrue]]
  });

  ngOnInit(): void {
    this.loadPricingPlans();
    this.setupCountryValidationWatcher();
    this.setupBusinessTypeWatcher();
    this.loadCountries();
    this.loadBusinessTypes();
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
    this.themeService.toggle();
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
      businessGroupId: '',
      businessTypeId: '',
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

      this.authService.persistLogin(response.data);

      this.loginUserId = response.data.userId;
      this.loginUserEmail = response.data.email;
      this.availableContexts = (response.data.contexts ?? []).map((context) =>
        this.authService.normalizeAuthContext(context)
      );

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

      const context = this.availableContexts[0];
      if (context) {
        this.authService.persistActiveContext(context);
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

      this.authService.persistContextSelection(response.data);

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
      | 'businessGroupId'
      | 'businessTypeId'
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
      if (controlName === 'businessGroupId') {
        return 'Business group is required.';
      }
      if (controlName === 'businessTypeId') {
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
      'Enter your business name, group, and type.',
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
          this.registerForm.controls.businessGroupId.valid &&
          this.registerForm.controls.businessTypeId.valid
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
        this.registerForm.controls.businessGroupId.markAsTouched();
        this.registerForm.controls.businessTypeId.markAsTouched();
        break;
    }
  }

  getBusinessTypesForSelectedGroup(): BusinessTypeDto[] {
    const selectedGroupId = this.registerForm.controls.businessGroupId.value;
    if (!selectedGroupId) {
      return [];
    }
    return this.businessGroups.find((group) => group.groupId === selectedGroupId)?.types ?? [];
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
    if (this.selectedPlanName) {
      sessionStorage.setItem('work-orbit.tenant.planName', this.selectedPlanName);
    }
    if (this.selectedPlanId) {
      sessionStorage.setItem('work-orbit.tenant.planId', this.selectedPlanId);
    }
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
        businessTypeId: this.registerForm.controls.businessTypeId.value,
        mobileNumber: `${selectedCountry.dialCode} ${nationalNumber}`
      };

      if (description) {
        payload['description'] = description;
      }
      if (this.selectedPlanName) {
        payload['planName'] = this.selectedPlanName;
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

      this.authService.setTenantId(tenantId);

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

  private setupBusinessTypeWatcher(): void {
    this.registerForm.controls.businessGroupId.valueChanges.subscribe(() => {
      this.registerForm.controls.businessTypeId.setValue('');
      this.registerForm.controls.businessTypeId.markAsUntouched();
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

  private async loadBusinessTypes(): Promise<void> {
    this.businessTypesLoading = true;
    this.businessTypesError = '';
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<BusinessGroupDto[]>>(API_ENDPOINTS.businessTypes.list)
      );
      if (!response.success || !Array.isArray(response.data) || response.data.length === 0) {
        this.businessTypesLoading = false;
        this.businessTypesError = response.message || 'Unable to load business types.';
        this.businessGroups = [];
        return;
      }
      this.businessGroups = response.data;
      this.businessTypesLoading = false;
    } catch {
      this.businessTypesLoading = false;
      this.businessTypesError = 'Unable to load business types.';
      this.businessGroups = [];
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
