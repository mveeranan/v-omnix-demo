import {
  AfterViewInit,
  Component,
  ElementRef,
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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@env/api.constants';
import { AuthService } from '@core/auth/auth.service';
import { TenantContextService } from '@features/admin/data-access/tenant-context.service';
import type { AuthContext, LoginData } from '@core/auth/models/auth.model';
import { extractLoginContexts } from '@core/auth/models/auth.model';
import { ThemeService } from '@core/theme/theme.service';
import { NotificationService } from '@core/notifications/notification.service';
import { getApiErrorMessage } from '@shared/utils/api-error.util';
import { firstValueFrom } from 'rxjs';
import { PhoneNumberFieldComponent } from '@shared/ui/phone-number-field.component';
import { EMPTY_PHONE_NUMBER } from '@shared/models/phone-number.model';
import { formatPhoneWithDialCode } from '@shared/utils/phone.util';
import { BusinessTypesService } from '@features/admin/data-access/business-types.service';
import { BusinessTypeDto } from '@features/admin/models/business-type.model';
import { PlanSelectionFlowService } from '../plan-selection/plan-selection-flow.service';
import {
  PlanApiDto,
  PricingPlan,
  PlanPrice,
  mapApiPlan
} from '../plan-selection/pricing-plan.model';
import { PlanCheckoutService } from '../plan-selection/plan-checkout.service';
import { WorkspaceSessionService } from '@features/portfolio/data-access/workspace-session.service';

interface PricingFeature {
  name: string;
  included: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

interface RegisterData {
  tenantId: string;
  lastPlanId?: string | null;
}

interface CheckoutSessionResponse {
  checkoutUrl: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, PhoneNumberFieldComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly tenantContext = inject(TenantContextService);
  private readonly notificationService = inject(NotificationService);
  private readonly themeService = inject(ThemeService);
  private readonly businessTypesService = inject(BusinessTypesService);
  private readonly planSelectionFlow = inject(PlanSelectionFlowService);
  private readonly planCheckout = inject(PlanCheckoutService);
  private readonly workspaceSession = inject(WorkspaceSessionService);
  @ViewChildren('revealEl') revealElements!: QueryList<ElementRef<HTMLElement>>;

  annual = false;
  readonly isDark = this.themeService.isDark;
  mobileMenuOpen = false;
  openFaqIndex: number | null = 0;
  countersStarted = false;
  showAuthChoiceModal = false;
  showLoginPanel = false;
  showRegisterPanel = false;
  planChosenFromPricing = false;
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
  postLoginRedirectUrl = '/admin/dashboard';
  availableContexts: AuthContext[] = [];
  selectedContextTenantId = '';
  businessLogoFile: File | null = null;
  businessLogoPreview: string | null = null;
  businessTypes: BusinessTypeDto[] = [];
  businessTypesLoading = false;
  businessTypesError = '';
  private revealObserver?: IntersectionObserver;
  private statsObserver?: IntersectionObserver;
  private revealFallbackTimer?: ReturnType<typeof setTimeout>;
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
  readonly buildingIcon = Building2;

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  readonly registerForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(30)]],
    lastName: ['', [Validators.required, Validators.maxLength(30)]],
    phone: [{ ...EMPTY_PHONE_NUMBER }],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    businessName: ['', [Validators.required, Validators.maxLength(80)]],
    businessTypeId: ['', [Validators.required]],
    description: [''],
    acceptTerms: [false, [Validators.requiredTrue]]
  });

  ngOnInit(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.postLoginRedirectUrl = returnUrl;
      this.openLoginPanel();
    }
    this.restoreRegistrationIfRequested();
    this.loadPricingPlans();
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
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
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
    this.planChosenFromPricing = true;
    this.applySelectedPlan(plan);
    this.showAuthChoiceModal = true;
    this.showLoginPanel = false;
    this.showRegisterPanel = false;
    this.authError = '';
    this.syncBodyScrollLock();
  }

  openLoginPanel(): void {
    this.showAuthChoiceModal = false;
    this.showRegisterPanel = false;
    this.planChosenFromPricing = false;
    this.clearSelectedPlan();
    this.showLoginPanel = true;
    this.authError = '';
    this.syncBodyScrollLock();
  }

  openRegisterPanel(): void {
    this.showAuthChoiceModal = false;
    this.showLoginPanel = false;
    this.showRegisterPanel = true;
    if (!this.planChosenFromPricing) {
      this.clearSelectedPlan();
    }
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

    this.registerForm.reset({
      firstName: '',
      lastName: '',
      phone: { ...EMPTY_PHONE_NUMBER },
      email: '',
      password: '',
      businessName: '',
      businessTypeId: '',
      description: '',
      acceptTerms: false
    });
    this.applyDefaultBusinessType();

    this.removeLogoFile();
    this.registerStep = 1;
    this.showLoginPassword = false;
    this.showRegisterPassword = false;

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

      this.loginUserEmail = response.data.email ?? this.loginForm.controls.email.value.trim();

      // This login is for store OWNERS/ADMINS only. Storefront customers (people who created
      // an account while shopping) have their own login on each store's website — their
      // Customer-role memberships are filtered out here so they never see admin workspaces,
      // and a customer-only account is rejected with a pointer to the right place.
      const allContexts = extractLoginContexts(response.data);
      this.availableContexts = allContexts.filter((context) =>
        context.roleName?.toUpperCase().includes('ADMIN')
      );

      if (this.availableContexts.length === 0) {
        this.authService.logout();
        this.authSubmitting = false;
        this.authError = allContexts.length
          ? 'This login is for store owners and administrators. To shop or view your orders, please log in on the store\'s own website.'
          : 'No workspace is assigned for this account.';
        this.notificationService.warning(this.authError);
        return;
      }

      if (this.availableContexts.length > 1) {
        // Multiple ADMIN workspaces (multi-store owner): still need to pick which store to
        // manage. This is a workspace picker, not a role picker — customer roles never appear.
        this.showLoginPanel = false;
        this.showContextSelectionModal = true;
        this.syncBodyScrollLock();
        this.selectedContextTenantId = this.availableContexts[0]?.tenantId ?? '';
        this.notificationService.info('Select a workspace to continue.');
        this.authSubmitting = false;
        return;
      }

      const context = this.availableContexts[0];
      if (context) {
        try {
          await firstValueFrom(this.workspaceSession.prepareContext(context));
        } catch {
          // Bootstrap timed out or failed — still allow navigation; admin shell retries in background.
        }
      }

      this.authSubmitting = false;
      this.notificationService.success('Login successful.');
      this.navigateAfterAuth();
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

  continueWithSelectedContext(): void {
    if (!this.selectedContextTenantId || this.contextSubmitting) {
      return;
    }

    const selected = this.availableContexts.find(
      (context) => context.tenantId === this.selectedContextTenantId
    );
    if (!selected) {
      this.contextError = 'Selected workspace could not be found. Please try again.';
      this.notificationService.error(this.contextError);
      return;
    }

    this.contextSubmitting = true;
    this.contextError = '';

    void firstValueFrom(this.workspaceSession.prepareContext(selected))
      .finally(() => {
        this.contextSubmitting = false;
      })
      .then(() => {
        this.notificationService.success('Context selected successfully.');
        this.closeAuthOverlays();
        this.navigateAfterAuth();
      })
      .catch(() => {
        this.contextError = 'Workspace is still loading. You can continue in the dashboard.';
        this.notificationService.warning(this.contextError);
        this.closeAuthOverlays();
        this.navigateAfterAuth();
      });
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

    this.registerForm.markAllAsTouched();
    if (!this.canProceedRegisterStep(4) || this.registerForm.invalid) {
      this.notificationService.warning('Please complete all required fields.');
      return;
    }

    if (!this.hasSelectedPlan()) {
      this.navigateToPlanSelectionPage();
      return;
    }

    this.authSubmitting = true;
    this.authError = '';
    await this.submitRegister();
  }

  getContextContinueText(context: AuthContext): string {
    return `Continue with ${context.tenantName} (${context.roleName}) - ${this.loginUserEmail}`;
  }

  getRegisterFieldError(
    controlName:
      | 'firstName'
      | 'lastName'
      | 'businessName'
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
      if (controlName === 'email') {
        return 'Email address is required.';
      }
      if (controlName === 'password') {
        return 'Password is required.';
      }
      if (controlName === 'businessName') {
        return 'Business name is required.';
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
          this.registerForm.controls.phone.valid
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
          Boolean(this.registerForm.getRawValue().businessTypeId?.trim())
        );
      case 4:
        return true;
      default:
        return false;
    }
  }

  tryAdvanceRegisterStep(): void {
    if (this.authSubmitting) {
      return;
    }
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
    if (this.authSubmitting) {
      return;
    }
    if (this.registerStep > 1) {
      this.registerStep -= 1;
    }
  }

  private markRegisterStepTouched(step: number): void {
    switch (step) {
      case 1:
        this.registerForm.controls.firstName.markAsTouched();
        this.registerForm.controls.lastName.markAsTouched();
        this.registerForm.controls.phone.markAsTouched();
        this.registerForm.controls.phone.updateValueAndValidity();
        break;
      case 2:
        this.registerForm.controls.email.markAsTouched();
        this.registerForm.controls.password.markAsTouched();
        this.registerForm.controls.acceptTerms.markAsTouched();
        break;
      case 3:
        this.registerForm.controls.businessName.markAsTouched();
        this.registerForm.controls.businessTypeId.markAsTouched();
        break;
    }
  }

  private async loadBusinessTypes(): Promise<void> {
    this.businessTypesLoading = true;
    this.businessTypesError = '';
    try {
      const types = await firstValueFrom(this.businessTypesService.list());
      if (!types.length) {
        this.businessTypesLoading = false;
        this.businessTypesError = 'Unable to load business types.';
        this.businessTypes = [];
        this.registerForm.controls.businessTypeId.enable({ emitEvent: false });
        this.registerForm.controls.businessTypeId.setValue('');
        return;
      }
      this.businessTypes = types;
      this.applyDefaultBusinessType();
      this.businessTypesLoading = false;
    } catch {
      this.businessTypesLoading = false;
      this.businessTypesError = 'Unable to load business types.';
      this.businessTypes = [];
      this.registerForm.controls.businessTypeId.enable({ emitEvent: false });
      this.registerForm.controls.businessTypeId.setValue('');
    }
  }

  private applyDefaultBusinessType(): void {
    const first = this.businessTypes[0];
    if (!first) {
      this.registerForm.controls.businessTypeId.enable({ emitEvent: false });
      this.registerForm.controls.businessTypeId.setValue('');
      return;
    }
    this.registerForm.controls.businessTypeId.setValue(first.id);
    this.registerForm.controls.businessTypeId.disable({ emitEvent: false });
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

  private navigateToDashboard(includeSetupState: boolean): void {
    this.closeAuthOverlays();
    if (this.selectedPlanName) {
      sessionStorage.setItem('work-orbit.tenant.planName', this.selectedPlanName);
    }
    if (this.selectedPlanId) {
      sessionStorage.setItem('work-orbit.tenant.planId', this.selectedPlanId);
    }
    const queryParams: Record<string, string | null> = {
      setupIncomplete: null,
      planId: null,
      planPriceId: null,
      stripePriceId: null
    };
    if (this.selectedPlanId) {
      queryParams['planId'] = this.selectedPlanId;
    }
    if (this.selectedPlanPriceId) {
      queryParams['planPriceId'] = this.selectedPlanPriceId;
    }
    if (this.selectedStripePriceId) {
      queryParams['stripePriceId'] = this.selectedStripePriceId;
    }
    if (includeSetupState) {
      queryParams['setupIncomplete'] = this.onboardingRequired ? '1' : '0';
    }
    this.router.navigate(['/admin/dashboard'], {
      queryParams
    });
  }

  private async submitRegister(): Promise<void> {
    try {
      const mobileNumber = formatPhoneWithDialCode(this.registerForm.controls.phone.value);
      if (!mobileNumber) {
        this.authSubmitting = false;
        this.authError = 'Please enter a valid mobile number.';
        this.notificationService.warning(this.authError);
        return;
      }

      const description = this.registerForm.controls.description.value.trim();

      const payload: Record<string, unknown> = {
        firstName: this.registerForm.controls.firstName.value.trim(),
        lastName: this.registerForm.controls.lastName.value.trim(),
        email: this.registerForm.controls.email.value.trim(),
        password: this.registerForm.controls.password.value,
        businessName: this.registerForm.controls.businessName.value.trim(),
        businessTypeId: this.registerForm.getRawValue().businessTypeId,
        mobileNumber
      };

      if (description) {
        payload['description'] = description;
      }
      if (this.selectedPlanId) {
        payload['planId'] = this.selectedPlanId;
        payload['lastPlanId'] = this.selectedPlanId;
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

      if (this.planChosenFromPricing && this.selectedPlanPriceId) {
        await this.initiateStripeCheckout(tenantId, this.selectedPlanPriceId);
      } else {
        this.authSubmitting = false;
        this.closeAuthOverlays();
        void this.router.navigate(['/select-plan'], { queryParams: { flow: 'register' } });
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
      const checkoutUrl = await this.planCheckout.initiateStripeCheckout(tenantId, planPriceId);
      this.authSubmitting = false;
      window.location.href = checkoutUrl;
    } catch (error) {
      this.authSubmitting = false;
      this.authError =
        this.extractErrorMessage(error) || 'Payment setup failed. Please try again.';
      this.notificationService.error(this.authError);
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

  hasSelectedPlan(): boolean {
    return Boolean(this.selectedPlanId.trim() && this.selectedPlanPriceId.trim());
  }

  private applySelectedPlan(plan: PricingPlan): void {
    this.selectedPlanId = plan.id;
    this.selectedPlanName = plan.name;
    const selectedPrice = this.getPlanPrice(plan);
    this.selectedPlanPriceId = selectedPrice?.planPriceId ?? '';
    this.selectedStripePriceId = selectedPrice?.stripePriceId ?? '';
  }

  private clearSelectedPlan(): void {
    this.selectedPlanId = '';
    this.selectedPlanName = '';
    this.selectedPlanPriceId = '';
    this.selectedStripePriceId = '';
  }

  private navigateToPlanSelectionPage(): void {
    const raw = this.registerForm.getRawValue();
    this.planSelectionFlow.setPendingRegistration(
      {
        firstName: raw.firstName,
        lastName: raw.lastName,
        phone: raw.phone,
        email: raw.email,
        password: raw.password,
        businessName: raw.businessName,
        businessTypeId: raw.businessTypeId,
        description: raw.description ?? '',
        acceptTerms: raw.acceptTerms,
        logoPreviewUrl: this.businessLogoPreview
      },
      this.businessLogoFile
    );
    this.showAuthChoiceModal = false;
    this.showLoginPanel = false;
    this.showRegisterPanel = false;
    this.syncBodyScrollLock();
    void this.router.navigate(['/select-plan'], { queryParams: { flow: 'register' } });
  }

  private restoreRegistrationIfRequested(): void {
    if (this.route.snapshot.queryParamMap.get('register') !== '1') {
      return;
    }

    const pending = this.planSelectionFlow.getPendingRegistration();
    if (!pending) {
      return;
    }

    this.registerForm.patchValue({
      firstName: pending.firstName,
      lastName: pending.lastName,
      phone: pending.phone,
      email: pending.email,
      password: pending.password,
      businessName: pending.businessName,
      businessTypeId: pending.businessTypeId,
      description: pending.description,
      acceptTerms: pending.acceptTerms
    });
    if (pending.businessTypeId) {
      this.registerForm.controls.businessTypeId.enable({ emitEvent: false });
      this.registerForm.controls.businessTypeId.setValue(pending.businessTypeId);
    }
    this.businessLogoPreview = pending.logoPreviewUrl;
    this.businessLogoFile = this.planSelectionFlow.getBusinessLogoFile();
    this.registerStep = 4;
    this.showAuthChoiceModal = false;
    this.showLoginPanel = false;
    this.showRegisterPanel = true;
    this.syncBodyScrollLock();
  }

  private navigateAfterAuth(): void {
    if (this.authService.requiresSubscriptionPayment()) {
      void this.router.navigate(['/select-plan'], {
        queryParams: {
          flow: 'renew',
          returnUrl: this.postLoginRedirectUrl
        }
      });
      return;
    }
    this.navigateToDashboard(false);
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

        const mappedPlans = response.data.map((plan, index) => mapApiPlan(plan, index));
        this.pricingPlans = mappedPlans.length > 0 ? mappedPlans : [];
        this.pricingLoading = false;
      },
      error: (err) => {
        this.pricingError = getApiErrorMessage(err, 'Unable to load pricing plans right now.');
        this.pricingLoading = false;
      }
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
