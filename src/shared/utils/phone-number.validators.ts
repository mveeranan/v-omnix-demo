import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CountryCodeOption } from '../models/country-code.model';
import {
  EMPTY_PHONE_NUMBER,
  normalizePhoneNumberValue,
  PhoneNumberValue
} from '../models/phone-number.model';
import { resolvePhoneCountry } from './phone-country.util';
import { nationalPhoneValidators } from './phone-validators';

export function validatePhoneNumberValue(
  value: PhoneNumberValue | null | undefined,
  options: { required?: boolean; country?: CountryCodeOption } = {}
): ValidationErrors | null {
  const normalized = normalizePhoneNumberValue(value ?? EMPTY_PHONE_NUMBER);

  if (options.required && !normalized.dialCode) {
    return { dialCodeRequired: true };
  }

  if (options.required && !normalized.nationalNumber) {
    return { phoneRequired: true };
  }

  if (!normalized.nationalNumber) {
    return null;
  }

  const nationalControl = { value: normalized.nationalNumber } as AbstractControl;
  for (const validator of nationalPhoneValidators(options.country)) {
    const result = validator(nationalControl);
    if (result) {
      return result;
    }
  }

  return null;
}

export function phoneNumberFieldValidator(
  required = false,
  countries: CountryCodeOption[] = []
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as PhoneNumberValue | null | undefined;
    const country = resolvePhoneCountry(value, countries);
    return validatePhoneNumberValue(value, { required, country });
  };
}