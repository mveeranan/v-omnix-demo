export interface CurrencyOption {
  value: string;
  label: string;
  symbol: string;
  decimals: number;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { value: 'USD', label: 'US Dollar',            symbol: '$',  decimals: 2 },
  { value: 'EUR', label: 'Euro',                 symbol: '€',  decimals: 2 },
  { value: 'GBP', label: 'British Pound',        symbol: '£',  decimals: 2 },
  { value: 'INR', label: 'Indian Rupee',         symbol: '₹',  decimals: 2 },
  { value: 'CAD', label: 'Canadian Dollar',      symbol: 'CA$', decimals: 2 },
  { value: 'AUD', label: 'Australian Dollar',    symbol: 'A$', decimals: 2 },
  { value: 'NZD', label: 'New Zealand Dollar',   symbol: 'NZ$', decimals: 2 },
  { value: 'SGD', label: 'Singapore Dollar',     symbol: 'S$', decimals: 2 },
  { value: 'HKD', label: 'Hong Kong Dollar',     symbol: 'HK$', decimals: 2 },
  { value: 'JPY', label: 'Japanese Yen',         symbol: '¥',  decimals: 0 },
  { value: 'CNY', label: 'Chinese Yuan',         symbol: '¥',  decimals: 2 },
  { value: 'KRW', label: 'South Korean Won',     symbol: '₩',  decimals: 0 },
  { value: 'CHF', label: 'Swiss Franc',          symbol: 'CHF', decimals: 2 },
  { value: 'SEK', label: 'Swedish Krona',        symbol: 'kr', decimals: 2 },
  { value: 'NOK', label: 'Norwegian Krone',      symbol: 'kr', decimals: 2 },
  { value: 'DKK', label: 'Danish Krone',         symbol: 'kr', decimals: 2 },
  { value: 'MXN', label: 'Mexican Peso',         symbol: '$',  decimals: 2 },
  { value: 'BRL', label: 'Brazilian Real',       symbol: 'R$', decimals: 2 },
  { value: 'ARS', label: 'Argentine Peso',       symbol: '$',  decimals: 2 },
  { value: 'CLP', label: 'Chilean Peso',         symbol: '$',  decimals: 0 },
  { value: 'COP', label: 'Colombian Peso',       symbol: '$',  decimals: 2 },
  { value: 'ZAR', label: 'South African Rand',   symbol: 'R',  decimals: 2 },
  { value: 'NGN', label: 'Nigerian Naira',       symbol: '₦',  decimals: 2 },
  { value: 'KES', label: 'Kenyan Shilling',      symbol: 'KSh', decimals: 2 },
  { value: 'EGP', label: 'Egyptian Pound',       symbol: 'E£', decimals: 2 },
  { value: 'AED', label: 'UAE Dirham',           symbol: 'AED', decimals: 2 },
  { value: 'SAR', label: 'Saudi Riyal',          symbol: '﷼',  decimals: 2 },
  { value: 'QAR', label: 'Qatari Riyal',         symbol: 'QR', decimals: 2 },
  { value: 'KWD', label: 'Kuwaiti Dinar',        symbol: 'KD', decimals: 3 },
  { value: 'BDT', label: 'Bangladeshi Taka',     symbol: '৳',  decimals: 2 },
  { value: 'PKR', label: 'Pakistani Rupee',      symbol: '₨',  decimals: 2 },
  { value: 'LKR', label: 'Sri Lankan Rupee',     symbol: '₨',  decimals: 2 },
  { value: 'NPR', label: 'Nepalese Rupee',       symbol: '₨',  decimals: 2 },
  { value: 'THB', label: 'Thai Baht',            symbol: '฿',  decimals: 2 },
  { value: 'MYR', label: 'Malaysian Ringgit',    symbol: 'RM', decimals: 2 },
  { value: 'IDR', label: 'Indonesian Rupiah',    symbol: 'Rp', decimals: 0 },
  { value: 'PHP', label: 'Philippine Peso',      symbol: '₱',  decimals: 2 },
  { value: 'VND', label: 'Vietnamese Dong',      symbol: '₫',  decimals: 0 },
  { value: 'TWD', label: 'Taiwan Dollar',        symbol: 'NT$', decimals: 2 },
  { value: 'TRY', label: 'Turkish Lira',         symbol: '₺',  decimals: 2 },
  { value: 'PLN', label: 'Polish Zloty',         symbol: 'zł', decimals: 2 },
  { value: 'CZK', label: 'Czech Koruna',         symbol: 'Kč', decimals: 2 },
  { value: 'HUF', label: 'Hungarian Forint',     symbol: 'Ft', decimals: 0 },
  { value: 'RON', label: 'Romanian Leu',         symbol: 'lei', decimals: 2 },
  { value: 'RUB', label: 'Russian Ruble',        symbol: '₽',  decimals: 2 },
  { value: 'UAH', label: 'Ukrainian Hryvnia',    symbol: '₴',  decimals: 2 },
  { value: 'ILS', label: 'Israeli Shekel',       symbol: '₪',  decimals: 2 },
];

export function getCurrencySymbol(code: string): string {
  return CURRENCY_OPTIONS.find(c => c.value === code)?.symbol ?? code;
}

export function getCurrencyDecimals(code: string): number {
  return CURRENCY_OPTIONS.find(c => c.value === code)?.decimals ?? 2;
}
