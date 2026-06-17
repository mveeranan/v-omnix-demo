import { CountryCodeOption } from '../models/country-code.model';
import { normalizePhoneNumberValue, PhoneNumberValue } from '../models/phone-number.model';

/** National digits-only check used to pick the best country when dial codes are shared. */
export function nationalFitsCountryRules(
  national: string,
  country: CountryCodeOption
): boolean {
  if (!national) {
    return true;
  }
  if (!/^\d+$/.test(national)) {
    return false;
  }
  const min = country.nationalNumberMinLength;
  const max = country.nationalNumberMaxLength;
  if (min !== undefined && national.length < min) {
    return false;
  }
  if (max !== undefined && national.length > max) {
    return false;
  }
  if (country.phoneNumberRegex) {
    try {
      return new RegExp(country.phoneNumberRegex).test(national);
    } catch {
      return true;
    }
  }
  return true;
}

/**
 * Resolves API country metadata for a phone value.
 * Prefers stored countryId (exact picker selection), then unique dial code, then best rule match.
 */
export function resolvePhoneCountry(
  value: PhoneNumberValue | null | undefined,
  countries: CountryCodeOption[]
): CountryCodeOption | undefined {
  const normalized = normalizePhoneNumberValue(value);
  if (!normalized.dialCode && !normalized.countryId) {
    return undefined;
  }

  if (normalized.countryId) {
    const byId = countries.find((c) => c.id === normalized.countryId);
    if (byId) {
      return byId;
    }
  }

  const dialMatches = countries.filter((c) => c.dialCode === normalized.dialCode);
  if (dialMatches.length === 0) {
    return undefined;
  }
  if (dialMatches.length === 1) {
    return dialMatches[0];
  }

  if (normalized.nationalNumber) {
    const fitting = dialMatches.filter((c) =>
      nationalFitsCountryRules(normalized.nationalNumber, c)
    );
    if (fitting.length === 1) {
      return fitting[0];
    }
    if (fitting.length > 1) {
      return fitting[0];
    }
  }

  return dialMatches[0];
}

export function countryPickerKey(country: CountryCodeOption, isoCode: string): string {
  return country.id ?? (isoCode ? `${country.dialCode}|${isoCode}` : country.dialCode);
}

export function findCountryByPickerKey(
  key: string,
  countries: CountryCodeOption[],
  isoCodeFn: (country: CountryCodeOption) => string
): CountryCodeOption | undefined {
  const trimmed = key.trim();
  if (!trimmed) {
    return undefined;
  }

  const byId = countries.find((c) => c.id === trimmed);
  if (byId) {
    return byId;
  }

  if (trimmed.includes('|')) {
    const [dialCode, iso] = trimmed.split('|');
    return countries.find(
      (c) => c.dialCode === dialCode && isoCodeFn(c).toUpperCase() === iso.toUpperCase()
    );
  }

  return countries.find((c) => c.dialCode === trimmed);
}
