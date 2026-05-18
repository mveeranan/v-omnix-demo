import fs from 'fs';

const htmlPath = 'src/components/home/home.component.html';
const outPath = 'src/components/home/_auth-modals-new.html';

const registerSteps = `
                @if (registerStep === 1) {
                  <div class="pa-form-grid two-col">
                    <motion.div class="pa-field" [class.pa-field-invalid]="!!getRegisterFieldError('firstName')">
                      <label class="pa-label" for="reg-first-name">First Name</label>
                      <motion.div class="pa-control">
                        <lucide-icon [img]="userIcon" class="pa-icon"></lucide-icon>
                        <input id="reg-first-name" formControlName="firstName" type="text" class="pa-input" placeholder="First name" />
                      </motion.div>
                      @if (getRegisterFieldError('firstName')) {
                        <p class="pa-error" role="alert">{{ getRegisterFieldError('firstName') }}</p>
                      }
                    </motion.div>
                    <motion.div class="pa-field" [class.pa-field-invalid]="!!getRegisterFieldError('lastName')">
                      <label class="pa-label" for="reg-last-name">Last Name</label>
                      <motion.div class="pa-control">
                        <lucide-icon [img]="userIcon" class="pa-icon"></lucide-icon>
                        <input id="reg-last-name" formControlName="lastName" type="text" class="pa-input" placeholder="Last name" />
                      </motion.div>
                      @if (getRegisterFieldError('lastName')) {
                        <p class="pa-error" role="alert">{{ getRegisterFieldError('lastName') }}</p>
                      }
                    </motion.div>
                  </motion.div>
                }
                @if (registerStep === 2) {
                  <motion.div class="pa-field" [class.pa-field-invalid]="!!getRegisterFieldError('countryCode') || !!countriesError">
                    <label class="pa-label">Country Code</label>
                    <motion.div class="country-picker-shell relative">
                      <button type="button" (click)="toggleCountryDropdown()" class="country-picker-btn country-picker-trigger btn-radius pa-input no-icon w-full text-left">
                        {{ getSelectedCountryLabel() }}
                      </button>
                      @if (isCountryDropdownOpen) {
                        <motion.div class="country-picker-panel btn-radius absolute z-30 mt-2 w-full rounded-xl border p-2 shadow-xl">
                          <input type="text" [value]="countrySearchTerm" (input)="onCountrySearchInput($event)" placeholder="Search country..." class="country-picker-search btn-radius w-full rounded-xl border px-3 py-2 text-sm outline-none" />
                          <motion.div class="country-picker-list btn-radius mt-2 max-h-40 overflow-auto rounded-xl border">
                            @if (getFilteredCountryOptions().length === 0) {
                              <p class="px-3 py-2 text-xs">No countries found.</p>
                            } @else {
                              @for (country of getFilteredCountryOptions(); track country.id ?? country.dialCode) {
                                <button type="button" (click)="selectCountryOption(country)" class="country-picker-option block w-full border-0 px-3 py-2 text-left text-sm">
                                  {{ country.name }} ({{ country.dialCode }})
                                </button>
                              }
                            }
                          </motion.div>
                        </motion.div>
                      }
                    </motion.div>
                    @if (getRegisterFieldError('countryCode')) {
                      <p class="pa-error" role="alert">{{ getRegisterFieldError('countryCode') }}</p>
                    }
                    @if (countriesLoading) {
                      <p class="text-xs" style="color: var(--pa-muted)">Loading countries...</p>
                    }
                    @if (countriesError) {
                      <p class="pa-error" role="alert">{{ countriesError }}</p>
                    }
                  </motion.div>
                  <motion.div class="pa-field" [class.pa-field-invalid]="!!getMobileNumberError()">
                    <label class="pa-label" for="reg-mobile">Mobile Number</label>
                    <motion.div class="pa-control">
                      <lucide-icon [img]="phoneIcon" class="pa-icon"></lucide-icon>
                      <input id="reg-mobile" formControlName="mobileNumber" type="text" class="pa-input" placeholder="Mobile number" />
                    </motion.div>
                    @if (getMobileNumberError()) {
                      <p class="pa-error" role="alert">{{ getMobileNumberError() }}</p>
                    }
                  </motion.div>
                }
                @if (registerStep === 3) {
                  <motion.div class="pa-field" [class.pa-field-invalid]="!!getRegisterFieldError('email')">
                    <label class="pa-label" for="reg-email">Email Address</label>
                    <motion.div class="pa-control">
                      <lucide-icon [img]="mailIcon" class="pa-icon"></lucide-icon>
                      <input id="reg-email" formControlName="email" type="email" class="pa-input" placeholder="you@company.com" />
                    </motion.div>
                    @if (getRegisterFieldError('email')) {
                      <p class="pa-error" role="alert">{{ getRegisterFieldError('email') }}</p>
                    }
                  </motion.div>
                  <motion.div class="pa-field" [class.pa-field-invalid]="!!getRegisterFieldError('password')">
                    <label class="pa-label" for="reg-password">Password</label>
                    <motion.div class="pa-control">
                      <lucide-icon [img]="lockIcon" class="pa-icon"></lucide-icon>
                      <input id="reg-password" formControlName="password" [type]="showRegisterPassword ? 'text' : 'password'" class="pa-input" placeholder="Minimum 8 characters" />
                      <button type="button" class="pa-toggle-btn" (click)="togglePasswordVisibility('register')" [attr.aria-label]="showRegisterPassword ? 'Hide password' : 'Show password'">
                        <lucide-icon [img]="showRegisterPassword ? eyeOffIcon : eyeIcon" class="h-4 w-4"></lucide-icon>
                      </button>
                    </motion.div>
                    @if (getRegisterFieldError('password')) {
                      <p class="pa-error" role="alert">{{ getRegisterFieldError('password') }}</p>
                    }
                  </motion.div>
                  <motion.div class="pa-field" [class.pa-field-invalid]="!!getRegisterFieldError('acceptTerms')">
                    <label class="pa-terms">
                      <input formControlName="acceptTerms" type="checkbox" class="terms-checkbox h-4 w-4 rounded" />
                      I agree to terms and privacy policy.
                    </label>
                    @if (getRegisterFieldError('acceptTerms')) {
                      <p class="pa-error" role="alert">{{ getRegisterFieldError('acceptTerms') }}</p>
                    }
                  </motion.div>
                }
                @if (registerStep === 4) {
                  <motion.div class="pa-field" [class.pa-field-invalid]="!!getRegisterFieldError('businessName')">
                    <label class="pa-label" for="reg-business-name">Business Name</label>
                    <motion.div class="pa-control">
                      <lucide-icon [img]="usersIcon" class="pa-icon"></lucide-icon>
                      <input id="reg-business-name" formControlName="businessName" type="text" class="pa-input" placeholder="Business name" />
                    </motion.div>
                    @if (getRegisterFieldError('businessName')) {
                      <p class="pa-error" role="alert">{{ getRegisterFieldError('businessName') }}</p>
                    }
                  </motion.div>
                  <motion.div class="pa-field" [class.pa-field-invalid]="!!getRegisterFieldError('businessType')">
                    <label class="pa-label" for="reg-business-type">Business Type</label>
                    <select id="reg-business-type" formControlName="businessType" class="pa-input no-icon">
                      <option [ngValue]="0">Select business type</option>
                      @for (item of businessTypeOptions; track item.value) {
                        <option [ngValue]="item.value">{{ item.label }}</option>
                      }
                    </select>
                    @if (getRegisterFieldError('businessType')) {
                      <p class="pa-error" role="alert">{{ getRegisterFieldError('businessType') }}</p>
                    }
                  </motion.div>
                  <motion.div class="pa-field">
                    <label class="pa-label" for="reg-description">Description (optional)</label>
                    <textarea id="reg-description" formControlName="description" rows="2" class="pa-input no-icon" placeholder="Short description"></textarea>
                  </motion.div>
                  <motion.div class="pa-field">
                    <label class="pa-label">Logo (optional)</label>
                    @if (!businessLogoPreview) {
                      <label class="logo-upload-zone logo-upload-zone--compact flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-3 transition-colors">
                        <lucide-icon [img]="uploadIcon" class="h-5 w-5"></lucide-icon>
                        <span class="text-xs">Upload logo · Max 2 MB</span>
                        <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" class="hidden" (change)="onLogoFileSelected($event)" />
                      </label>
                    } @else {
                      <motion.div class="logo-preview-wrapper logo-preview-wrapper--compact relative flex w-full items-center gap-2 rounded-xl border p-2">
                        <img [src]="businessLogoPreview" alt="Logo preview" class="h-10 w-10 rounded-lg object-cover" />
                        <span class="truncate text-xs font-medium flex-1">{{ businessLogoFile?.name }}</span>
                        <button type="button" (click)="removeLogoFile()" class="shrink-0 rounded-full p-1" title="Remove logo">
                          <lucide-icon [img]="xIcon" class="h-4 w-4"></lucide-icon>
                        </button>
                      </motion.div>
                    }
                  </motion.div>
                }
`.replace(/<\/?motion\.motion.div/g, '').replace(/<\/?motion\.motion.div/g, '').replace(/motion\.div/g, 'div');

const stepPills = `
                <motion.div class="pa-steps pa-steps--four">
                  @for (step of [1, 2, 3, 4]; track step) {
                    <motion.div class="pa-step" [class.active]="isRegisterStepActive(step)" [class.done]="isRegisterStepComplete(step)">
                      {{ step }} · {{ getRegisterStepLabel(step) }}
                    </motion.div>
                  }
                </motion.div>
`.replace(/<\/?motion\.div/g, (m) => m.replace('motion.', ''));

// Fix registerSteps - the replace might have failed. Let me fix registerSteps variable
const rs = registerSteps.replaceAll('motion.div', 'DIV_PLACEHOLDER').replaceAll('DIV_PLACEHOLDER', 'motion.div');
// That's wrong
