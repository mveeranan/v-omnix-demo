import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CountryCodeOption } from '../models/country-code.model';

export function nationalPhoneValidators(country?: CountryCodeOption): ValidatorFn[] {
  const validators: ValidatorFn[] = [];

  if (country?.nationalNumberMinLength) {
    validators.push(Validators.minLength(country.nationalNumberMinLength));
  }
  if (country?.nationalNumberMaxLength) {
    validators.push(Validators.maxLength(country.nationalNumberMaxLength));
  }
  if (country?.phoneNumberRegex) {
    try {
      validators.push(Validators.pattern(new RegExp(country.phoneNumberRegex)));
    } catch {
      // Ignore malformed regex from backend.
    }
  }

  validators.push(mobileDigitsValidator(country));
  return validators;
}

function mobileDigitsValidator(country?: CountryCodeOption): ValidatorFn {
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
