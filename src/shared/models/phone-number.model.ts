export interface PhoneNumberValue {
  dialCode: string;
  nationalNumber: string;
  /** Set when user picks a country from the list (disambiguates shared dial codes like +599). */
  countryId?: string;
}

export const EMPTY_PHONE_NUMBER: PhoneNumberValue = {
  dialCode: '',
  nationalNumber: ''
};

export function sanitizeNationalNumber(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizePhoneNumberValue(
  value: PhoneNumberValue | null | undefined
): PhoneNumberValue {
  const countryId = (value?.countryId ?? '').trim() || undefined;
  return {
    dialCode: (value?.dialCode ?? '').trim(),
    nationalNumber: sanitizeNationalNumber(value?.nationalNumber ?? ''),
    ...(countryId ? { countryId } : {})
  };
}

export function phoneNumbersEqual(
  a: PhoneNumberValue | null | undefined,
  b: PhoneNumberValue | null | undefined
): boolean {
  const left = normalizePhoneNumberValue(a);
  const right = normalizePhoneNumberValue(b);
  return left.dialCode === right.dialCode && left.nationalNumber === right.nationalNumber;
}
