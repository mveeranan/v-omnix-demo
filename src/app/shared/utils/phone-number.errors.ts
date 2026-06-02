import { ValidationErrors } from '@angular/forms';
import { CountryCodeOption } from '../models/country-code.model';

export function getPhoneNumberFieldError(
  errors: ValidationErrors | null | undefined,
  country?: CountryCodeOption,
  options?: { required?: boolean }
): string {
  if (!errors) {
    return '';
  }

  if (errors['required'] || errors['phoneRequired']) {
    return 'Phone number is required.';
  }

  if (errors['dialCodeRequired']) {
    return 'Country code is required.';
  }

  const minLength = country?.nationalNumberMinLength;
  const maxLength = country?.nationalNumberMaxLength;

  if ((errors['minlength'] || errors['mobileLength']) && minLength) {
    return `Phone number must be at least ${minLength} digits.`;
  }

  if ((errors['maxlength'] || errors['mobileLength']) && maxLength) {
    return `Phone number must be at most ${maxLength} digits.`;
  }

  if (errors['pattern'] || errors['mobilePattern']) {
    if (country?.phoneNumberExample) {
      return `Invalid format. Example: ${country.phoneNumberExample}`;
    }
    return 'Invalid phone number format.';
  }

  if (options?.required) {
    return 'Phone number is required.';
  }

  return 'Invalid phone number.';
}
