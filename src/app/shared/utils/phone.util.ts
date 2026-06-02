import { CountryCodeOption } from '../models/country-code.model';
import {
  EMPTY_PHONE_NUMBER,
  PhoneNumberValue,
  normalizePhoneNumberValue
} from '../models/phone-number.model';
import { resolvePhoneCountry } from './phone-country.util';

export type { PhoneNumberValue } from '../models/phone-number.model';
export { EMPTY_PHONE_NUMBER, normalizePhoneNumberValue } from '../models/phone-number.model';

export interface ParsedPhone {
  dialCode: string;
  nationalNumber: string;
}

export function parseStoredPhone(
  phone: string | null | undefined,
  countries: CountryCodeOption[]
): ParsedPhone {
  const trimmed = (phone ?? '').trim();
  if (!trimmed) {
    return { dialCode: '', nationalNumber: '' };
  }

  const sorted = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const country of sorted) {
    if (trimmed.startsWith(country.dialCode)) {
      return {
        dialCode: country.dialCode,
        nationalNumber: trimmed.slice(country.dialCode.length).replace(/^\s+/, '').trim()
      };
    }
  }

  const [first, ...rest] = trimmed.split(/\s+/);
  if (first?.startsWith('+')) {
    return { dialCode: first, nationalNumber: rest.join(' ').trim() };
  }

  return { dialCode: '', nationalNumber: trimmed };
}

export function parsePhoneNumberValue(
  phone: string | null | undefined,
  countries: CountryCodeOption[]
): PhoneNumberValue {
  const parsed = parseStoredPhone(phone, countries);
  const preferred =
    countries.length > 0
      ? (countries.find((c) => c.dialCode === '+971')?.dialCode ?? countries[0]?.dialCode ?? '')
      : '';
  const draft = normalizePhoneNumberValue({
    dialCode: parsed.dialCode || preferred,
    nationalNumber: parsed.nationalNumber
  });
  const country = resolvePhoneCountry(draft, countries);
  return normalizePhoneNumberValue({
    ...draft,
    countryId: country?.id
  });
}

export { resolvePhoneCountry } from './phone-country.util';

export function formatPhoneWithDialCode(
  dialCode: string,
  nationalNumber: string
): string | null;
export function formatPhoneWithDialCode(value: PhoneNumberValue | null | undefined): string | null;
export function formatPhoneWithDialCode(
  dialCodeOrValue: string | PhoneNumberValue | null | undefined,
  nationalNumber?: string
): string | null {
  if (typeof dialCodeOrValue === 'object' && dialCodeOrValue !== null) {
    const normalized = normalizePhoneNumberValue(dialCodeOrValue);
    return formatPhoneWithDialCode(normalized.dialCode, normalized.nationalNumber);
  }
  const dialCode = (dialCodeOrValue ?? '').trim();
  const national = (nationalNumber ?? '').trim();
  if (!national) {
    return null;
  }
  if (!dialCode) {
    return national;
  }
  return `${dialCode} ${national}`;
}

export function displayPhoneValue(phone: string | null | undefined): string {
  return (phone ?? '').trim() || '—';
}
