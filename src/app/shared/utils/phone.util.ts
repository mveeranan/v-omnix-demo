import { CountryCodeOption } from '../models/country-code.model';

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

export function formatPhoneWithDialCode(dialCode: string, nationalNumber: string): string | null {
  const national = nationalNumber.trim();
  if (!national) {
    return null;
  }
  const dial = dialCode.trim();
  if (!dial) {
    return national;
  }
  return `${dial} ${national}`;
}

export function displayPhoneValue(phone: string | null | undefined): string {
  return (phone ?? '').trim() || '—';
}
