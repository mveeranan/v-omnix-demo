import {
  Component,
  computed,
  forwardRef,
  HostListener,
  inject,
  input,
  signal
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { CountriesService } from '../data-access/countries.service';
import { CountryCodeOption } from '../models/country-code.model';
import { countryPickerKey, findCountryByPickerKey } from '../utils/phone-country.util';

export type CountryPickerMode = 'dial' | 'iso' | 'phone';

@Component({
  selector: 'app-country-dial-code-picker',
  standalone: true,
  template: `
    @if (layout() === 'pa-icon-control') {
      <div class="country-picker-shell relative">
        <div class="pa-control">
          <ng-content select="[pickerIcon]" />
          <button
            type="button"
            class="country-picker-trigger w-full text-left"
            [class]="triggerClass()"
            [disabled]="isDisabled()"
            (click)="toggleDropdown()"
          >
            {{ displayLabel() }}
          </button>
        </div>
        @if (dropdownOpen()) {
          <div class="country-picker-panel absolute z-30 mt-2 w-full rounded-xl border p-2 shadow-xl">
            <input
              type="text"
              [value]="searchTerm()"
              (input)="onSearchInput($event)"
              [placeholder]="searchPlaceholder()"
              class="country-picker-search w-full rounded-xl border px-3 py-2 text-sm outline-none"
            />
            <div class="country-picker-list mt-2 max-h-52 overflow-auto rounded-xl border">
              @if (countriesService.loading()) {
                <p class="country-picker-empty px-3 py-2 text-xs">Loading countries...</p>
              } @else if (countriesService.error()) {
                <p class="country-picker-empty px-3 py-2 text-xs">{{ countriesService.error() }}</p>
              } @else if (filteredCountries().length === 0) {
                <p class="country-picker-empty px-3 py-2 text-xs">No countries found.</p>
              } @else {
                @for (country of filteredCountries(); track trackCountry(country)) {
                  <button
                    type="button"
                    class="country-picker-option block w-full border-0 px-3 py-2 text-left text-sm"
                    (click)="selectCountry(country)"
                  >
                    {{ optionLabel(country) }}
                  </button>
                }
              }
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="country-picker-shell relative">
        <button
          type="button"
          class="country-picker-trigger w-full text-left"
          [class]="triggerClass()"
          [disabled]="isDisabled()"
          (click)="toggleDropdown()"
        >
          {{ displayLabel() }}
        </button>

        @if (dropdownOpen()) {
          <div class="country-picker-panel absolute z-30 mt-2 w-full rounded-xl border p-2 shadow-xl">
            <input
              type="text"
              [value]="searchTerm()"
              (input)="onSearchInput($event)"
              [placeholder]="searchPlaceholder()"
              class="country-picker-search w-full rounded-xl border px-3 py-2 text-sm outline-none"
            />
            <div class="country-picker-list mt-2 max-h-52 overflow-auto rounded-xl border">
              @if (countriesService.loading()) {
                <p class="country-picker-empty px-3 py-2 text-xs">Loading countries...</p>
              } @else if (countriesService.error()) {
                <p class="country-picker-empty px-3 py-2 text-xs">{{ countriesService.error() }}</p>
              } @else if (filteredCountries().length === 0) {
                <p class="country-picker-empty px-3 py-2 text-xs">No countries found.</p>
              } @else {
                @for (country of filteredCountries(); track trackCountry(country)) {
                  <button
                    type="button"
                    class="country-picker-option block w-full border-0 px-3 py-2 text-left text-sm"
                    (click)="selectCountry(country)"
                  >
                    {{ optionLabel(country) }}
                  </button>
                }
              }
            </div>
          </div>
        }
      </div>
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CountryDialCodePickerComponent),
      multi: true
    }
  ]
})
export class CountryDialCodePickerComponent implements ControlValueAccessor {
  readonly variant = input<'pf-editor' | 'pa'>('pf-editor');
  readonly layout = input<'standalone' | 'pa-icon-control'>('standalone');
  readonly mode = input<CountryPickerMode>('dial');
  readonly countriesService = inject(CountriesService);

  readonly dropdownOpen = signal(false);
  readonly searchTerm = signal('');
  private readonly value = signal('');
  private disabledState = false;
  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    this.countriesService.load();
  }

  readonly filteredCountries = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const items = this.countriesService.countries();
    if (!search) {
      return items;
    }
    return items.filter((country) => {
      const name = country.name.toLowerCase();
      const dial = country.dialCode.toLowerCase();
      const iso = this.countriesService.isoCode(country).toLowerCase();
      return name.includes(search) || dial.includes(search) || iso.includes(search);
    });
  });

  readonly displayLabel = computed(() => {
    this.countriesService.countries();
    const selected = this.findSelected(this.value());
    if (!selected) {
      return this.mode() === 'iso' ? 'Select country' : 'Select country code';
    }
    return this.optionLabel(selected);
  });

  triggerClass(): string {
    return this.variant() === 'pa'
      ? 'pa-input pa-input--picker country-picker-btn w-full text-left'
      : 'pf-editor-input pf-editor-input--picker country-picker-btn';
  }

  searchPlaceholder(): string {
    return this.mode() === 'iso' ? 'Search country...' : 'Search country code...';
  }

  isDisabled(): boolean {
    return this.disabledState;
  }

  optionLabel(country: CountryCodeOption): string {
    if (this.mode() === 'iso') {
      const iso = this.countriesService.isoCode(country);
      return iso ? `${country.name} (${iso})` : country.name;
    }
    return `${country.name} (${country.dialCode})`;
  }

  trackCountry(country: CountryCodeOption): string {
    return country.id ?? this.resolveValue(country) ?? country.name;
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledState = isDisabled;
  }

  toggleDropdown(): void {
    if (this.isDisabled()) {
      return;
    }
    this.dropdownOpen.update((open) => !open);
    if (this.dropdownOpen()) {
      this.searchTerm.set('');
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  selectCountry(country: CountryCodeOption): void {
    const next = this.resolveValue(country);
    if (!next) {
      return;
    }
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
    this.dropdownOpen.set(false);
    this.searchTerm.set('');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.country-picker-shell')) {
      this.dropdownOpen.set(false);
    }
  }

  private resolveValue(country: CountryCodeOption): string {
    if (this.mode() === 'iso') {
      return this.countriesService.isoCode(country);
    }
    if (this.mode() === 'phone') {
      return countryPickerKey(country, this.countriesService.isoCode(country));
    }
    return country.dialCode;
  }

  private findSelected(value: string): CountryCodeOption | undefined {
    if (this.mode() === 'iso') {
      return this.countriesService.findByIsoCode(value);
    }
    if (this.mode() === 'phone') {
      return findCountryByPickerKey(value, this.countriesService.countries(), (c) =>
        this.countriesService.isoCode(c)
      );
    }
    return this.countriesService.findByDialCode(value);
  }
}
