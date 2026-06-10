import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { API_ENDPOINTS } from '../../../environments/api.constants';
import { CountryCodeOption } from '../models/country-code.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class CountriesService {
  private readonly http = inject(HttpClient);
  private readonly loaded = signal(false);
  private cache$?: Observable<CountryCodeOption[]>;

  readonly countries = signal<CountryCodeOption[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  load(): void {
    if (this.loaded()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.list().subscribe({
      next: (items) => {
        this.countries.set(items);
        this.loaded.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load countries.');
        this.loading.set(false);
      }
    });
  }

  list(): Observable<CountryCodeOption[]> {
    if (this.cache$) {
      return this.cache$;
    }

    this.cache$ = this.http
      .get<ApiResponse<unknown[]>>(API_ENDPOINTS.countries.list)
      .pipe(
        map((response) => {
          if (!response.success || !Array.isArray(response.data)) {
            throw new Error(response.message || 'Unable to load countries.');
          }
          return response.data.map((item) => this.normalizeCountry(item));
        }),
        tap((items) => {
          this.countries.set(items);
          this.loaded.set(true);
        }),
        shareReplay(1)
      );

    return this.cache$;
  }

  preferredDialCode(items: CountryCodeOption[]): string {
    return items.find((item) => item.dialCode === '+971')?.dialCode ?? items[0]?.dialCode ?? '';
  }

  findById(id: string): CountryCodeOption | undefined {
    const normalized = id.trim();
    if (!normalized) {
      return undefined;
    }
    return this.countries().find((option) => option.id === normalized);
  }

  findByDialCode(dialCode: string): CountryCodeOption | undefined {
    const normalized = dialCode.trim();
    return this.countries().find((option) => option.dialCode === normalized);
  }

  isoCode(country: CountryCodeOption): string {
    const candidates = [
      country.iso2,
      country.isoCode,
      country.code,
      country.countryCode
    ];

    for (const candidate of candidates) {
      const normalized = String(candidate ?? '').trim().toUpperCase();
      if (/^[A-Z]{2}$/.test(normalized)) {
        return normalized;
      }
    }

    return '';
  }

  findByIsoCode(isoCode: string): CountryCodeOption | undefined {
    const normalized = isoCode.trim().toUpperCase();
    if (!normalized) {
      return undefined;
    }
    return this.countries().find((option) => this.isoCode(option) === normalized);
  }

  /** Maps branch/API stored country values to a 2-letter ISO code for the form. */
  resolveBranchCountryCode(stored?: string | null): string {
    const value = (stored ?? '').trim();
    if (!value) {
      return '';
    }

    const upper = value.toUpperCase();
    if (/^[A-Z]{2}$/.test(upper)) {
      return upper;
    }

    const byIso = this.findByIsoCode(upper);
    if (byIso) {
      return this.isoCode(byIso);
    }

    const byName = this.countries().find(
      (country) => country.name.trim().toLowerCase() === value.toLowerCase()
    );
    if (byName) {
      return this.isoCode(byName);
    }

    if (value.startsWith('+')) {
      const byDial = this.findByDialCode(value);
      if (byDial) {
        return this.isoCode(byDial);
      }
    }

    return '';
  }

  private normalizeCountry(raw: unknown): CountryCodeOption {
    const item = (raw ?? {}) as Record<string, unknown>;
    const name = String(item['name'] ?? item['Name'] ?? '').trim();
    const dialCode = String(item['dialCode'] ?? item['DialCode'] ?? '').trim();

    return {
      id: this.optionalString(item['id'] ?? item['Id']),
      name,
      dialCode,
      code: this.optionalString(item['code'] ?? item['Code']),
      countryCode: this.optionalString(item['countryCode'] ?? item['CountryCode']),
      iso2: this.optionalString(item['iso2'] ?? item['Iso2']),
      isoCode: this.optionalString(item['isoCode'] ?? item['IsoCode']),
      phoneNumberRegex: this.optionalString(item['phoneNumberRegex'] ?? item['PhoneNumberRegex']),
      phoneNumberExample: this.optionalString(
        item['phoneNumberExample'] ?? item['PhoneNumberExample']
      ),
      nationalNumberMinLength: this.optionalNumber(
        item['nationalNumberMinLength'] ?? item['NationalNumberMinLength']
      ),
      nationalNumberMaxLength: this.optionalNumber(
        item['nationalNumberMaxLength'] ?? item['NationalNumberMaxLength']
      )
    };
  }

  private optionalString(value: unknown): string | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    const text = String(value).trim();
    return text || undefined;
  }

  private optionalNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  }
}
