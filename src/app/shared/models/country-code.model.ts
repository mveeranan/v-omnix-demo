export interface CountryCodeOption {
  id?: string;
  name: string;
  dialCode: string;
  code?: string;
  countryCode?: string;
  iso2?: string;
  isoCode?: string;
  phoneNumberRegex?: string;
  phoneNumberExample?: string;
  nationalNumberMinLength?: number;
  nationalNumberMaxLength?: number;
}
