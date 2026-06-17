import { CountryCodeOption } from '../models/country-code.model';
import { PhoneNumberValue } from '../models/phone-number.model';
import { validatePhoneNumberValue } from './phone-number.validators';

const caribbeanNetherlands: CountryCodeOption = {
  id: '6acc74ce-ca1a-87ef-ece0-605da1ad1436',
  name: 'Caribbean Netherlands',
  isoCode: 'BQ',
  dialCode: '+599',
  phoneNumberRegex: '^\\d{7,7}$',
  phoneNumberExample: '3181234',
  nationalNumberMinLength: 7,
  nationalNumberMaxLength: 7
};

describe('validatePhoneNumberValue', () => {
  it('requires dial code and national number when required', () => {
    const empty: PhoneNumberValue = { dialCode: '', nationalNumber: '' };
    expect(validatePhoneNumberValue(empty, { required: true })).toEqual({
      dialCodeRequired: true
    });

    const noNational: PhoneNumberValue = { dialCode: '+599', nationalNumber: '' };
    expect(validatePhoneNumberValue(noNational, { required: true, country: caribbeanNetherlands })).toEqual({
      phoneRequired: true
    });
  });

  it('enforces 7-digit national number for Caribbean Netherlands (+599)', () => {
    const tooShort: PhoneNumberValue = {
      dialCode: '+599',
      nationalNumber: '318123',
      countryId: caribbeanNetherlands.id
    };
    expect(
      validatePhoneNumberValue(tooShort, { country: caribbeanNetherlands })
    ).toEqual({ minlength: { requiredLength: 7, actualLength: 6 } });

    const tooLong: PhoneNumberValue = {
      dialCode: '+599',
      nationalNumber: '31812345',
      countryId: caribbeanNetherlands.id
    };
    expect(
      validatePhoneNumberValue(tooLong, { country: caribbeanNetherlands })
    ).toEqual({ maxlength: { requiredLength: 7, actualLength: 8 } });

    const valid: PhoneNumberValue = {
      dialCode: '+599',
      nationalNumber: '3181234',
      countryId: caribbeanNetherlands.id
    };
    expect(validatePhoneNumberValue(valid, { country: caribbeanNetherlands })).toBeNull();
  });

  it('rejects non-digit characters in national number', () => {
    const invalid: PhoneNumberValue = {
      dialCode: '+599',
      nationalNumber: '318-123',
      countryId: caribbeanNetherlands.id
    };
    expect(validatePhoneNumberValue(invalid, { country: caribbeanNetherlands })).toEqual({
      minlength: { requiredLength: 7, actualLength: 6 }
    });
  });
});
