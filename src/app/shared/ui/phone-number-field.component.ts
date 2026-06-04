import {

  Component,

  computed,

  effect,

  forwardRef,

  inject,

  Injector,

  input,

  OnInit,

  signal

} from '@angular/core';

import {

  AbstractControl,

  ControlValueAccessor,

  FormsModule,

  NG_VALIDATORS,

  NG_VALUE_ACCESSOR,

  NgControl,

  ValidationErrors,

  Validator

} from '@angular/forms';

import { LucideAngularModule, Globe, Phone } from 'lucide-angular';

import { CountriesService } from '../data-access/countries.service';

import {

  EMPTY_PHONE_NUMBER,

  normalizePhoneNumberValue,

  PhoneNumberValue

} from '../models/phone-number.model';

import { getPhoneNumberFieldError } from '../utils/phone-number.errors';

import { validatePhoneNumberValue } from '../utils/phone-number.validators';

import {

  countryPickerKey,

  findCountryByPickerKey,

  resolvePhoneCountry

} from '../utils/phone-country.util';

import { CountryDialCodePickerComponent } from './country-dial-code-picker.component';



@Component({

  selector: 'app-phone-number-field',

  standalone: true,

  imports: [FormsModule, CountryDialCodePickerComponent, LucideAngularModule],

  templateUrl: './phone-number-field.component.html',
  styleUrl: './phone-number-field.component.scss',

  providers: [

    {

      provide: NG_VALUE_ACCESSOR,

      useExisting: forwardRef(() => PhoneNumberFieldComponent),

      multi: true

    },

    {

      provide: NG_VALIDATORS,

      useExisting: forwardRef(() => PhoneNumberFieldComponent),

      multi: true

    }

  ]

})

export class PhoneNumberFieldComponent implements ControlValueAccessor, Validator, OnInit {

  readonly variant = input<'pf-editor' | 'pa'>('pf-editor');

  readonly required = input(false);

  readonly countryCodeLabel = input('Country code');

  readonly phoneLabel = input('Phone number');

  readonly phonePlaceholder = input('');

  readonly showErrors = input(true);

  readonly disabled = input(false);



  readonly globeIcon = Globe;

  readonly phoneIcon = Phone;



  private readonly countriesService = inject(CountriesService);

  private readonly injector = inject(Injector);



  private ngControl: NgControl | null = null;

  private readonly value = signal<PhoneNumberValue>({ ...EMPTY_PHONE_NUMBER });

  private disabledState = false;

  private onChange: (value: PhoneNumberValue) => void = () => undefined;

  private onTouched: () => void = () => undefined;



  readonly selectedCountry = computed(() =>

    resolvePhoneCountry(this.value(), this.countriesService.countries())

  );



  readonly countryPickerValue = computed(() => {

    const current = this.value();

    const country = this.selectedCountry();

    if (country) {

      return countryPickerKey(country, this.countriesService.isoCode(country));

    }

    return current.countryId ?? current.dialCode;

  });



  readonly resolvedPlaceholder = computed(() => {

    const custom = this.phonePlaceholder().trim();

    if (custom) {

      return custom;

    }

    return this.selectedCountry()?.phoneNumberExample ?? 'Mobile number';

  });



  readonly nationalMaxLength = computed(

    () => this.selectedCountry()?.nationalNumberMaxLength

  );



  readonly validationErrors = computed(() =>

    validatePhoneNumberValue(this.value(), {

      required: this.required(),

      country: this.selectedCountry()

    })

  );



  readonly errorMessage = computed(() => {

    if (!this.showErrors() || !this.shouldShowErrors()) {

      return '';

    }

    const errors = this.controlErrors();

    return getPhoneNumberFieldError(errors, this.selectedCountry(), {

      required: this.required()

    });

  });



  readonly countriesLoading = this.countriesService.loading;

  readonly countriesError = this.countriesService.error;



  constructor() {

    this.countriesService.load();

    effect(() => {

      const preferred = this.countriesService.preferredDialCode(this.countriesService.countries());

      if (preferred && !this.value().dialCode) {

        this.setCountryFromPickerKey(

          this.preferredCountryPickerKey(preferred),

          { emit: false }

        );

      }

    });

    effect(() => {

      const count = this.countriesService.countries().length;

      if (count > 0) {

        this.revalidateParent();

      }

    });

  }



  ngOnInit(): void {

    this.ngControl = this.injector.get(NgControl, null);

    if (this.ngControl) {

      this.ngControl.valueAccessor = this;

    }

    this.countriesService.list().subscribe({

      next: () => this.ensurePreferredDialCode(),

      error: () => undefined

    });

  }



  dialCode(): string {

    return this.value().dialCode;

  }



  nationalNumber(): string {

    return this.value().nationalNumber;

  }



  isFieldDisabled(): boolean {

    return this.disabled() || this.disabledState;

  }



  isInvalid(): boolean {

    const control = this.ngControl?.control;

    if (control) {

      return control.invalid;

    }

    return !!this.validationErrors();

  }



  shouldShowErrors(): boolean {

    const control = this.ngControl?.control;

    const touched = control?.touched ?? false;

    const dirty = control?.dirty ?? false;

    return (touched || dirty) && this.isInvalid();

  }



  onCountryPickerChange(pickerKey: string): void {

    this.setCountryFromPickerKey(pickerKey);

  }



  onNationalNumberInput(event: Event): void {

    const inputEl = event.target as HTMLInputElement;

    this.patchValue({ nationalNumber: inputEl.value });

    this.emitChange();

    this.revalidateParent();

  }



  onNationalNumberBlur(): void {

    this.onTouched();

    this.revalidateParent();

  }



  writeValue(value: PhoneNumberValue | null): void {

    this.value.set(normalizePhoneNumberValue(value));

    this.ensurePreferredDialCode();

    this.revalidateParent();

  }



  registerOnChange(fn: (value: PhoneNumberValue) => void): void {

    this.onChange = fn;

  }



  registerOnTouched(fn: () => void): void {

    this.onTouched = fn;

  }



  setDisabledState(isDisabled: boolean): void {

    this.disabledState = isDisabled;

  }



  validate(control: AbstractControl): ValidationErrors | null {

    const value = (control.value as PhoneNumberValue | null | undefined) ?? this.value();

    return validatePhoneNumberValue(value, {

      required: this.required(),

      country: resolvePhoneCountry(value, this.countriesService.countries())

    });

  }



  private controlErrors(): ValidationErrors | null {

    const control = this.ngControl?.control;

    if (control?.errors) {

      return control.errors;

    }

    return this.validationErrors();

  }



  private setCountryFromPickerKey(

    pickerKey: string,

    options: { emit?: boolean } = { emit: true }

  ): void {

    const country = findCountryByPickerKey(

      pickerKey,

      this.countriesService.countries(),

      (c) => this.countriesService.isoCode(c)

    );

    if (country) {

      this.patchValue({

        countryId: country.id,

        dialCode: country.dialCode

      });

    } else {

      this.patchValue({

        countryId: undefined,

        dialCode: pickerKey.trim()

      });

    }

    if (options.emit !== false) {

      this.emitChange();

      this.revalidateParent();

    }

  }



  private preferredCountryPickerKey(dialCode: string): string {

    const country = this.countriesService.findByDialCode(dialCode);

    if (country) {

      return countryPickerKey(country, this.countriesService.isoCode(country));

    }

    return dialCode;

  }



  private patchValue(patch: Partial<PhoneNumberValue>): void {

    this.value.update((current) => normalizePhoneNumberValue({ ...current, ...patch }));

  }



  private emitChange(): void {

    const next = normalizePhoneNumberValue(this.value());

    this.onChange(next);

  }



  private ensurePreferredDialCode(): void {

    if (this.value().dialCode.trim()) {

      return;

    }

    const preferred = this.countriesService.preferredDialCode(this.countriesService.countries());

    if (preferred) {

      this.setCountryFromPickerKey(this.preferredCountryPickerKey(preferred), { emit: true });

    }

  }



  private revalidateParent(): void {

    const control = this.ngControl?.control;

    if (!control) {

      return;

    }

    control.updateValueAndValidity({ emitEvent: false });

  }

}


