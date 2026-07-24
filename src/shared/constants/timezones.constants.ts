export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  // UTC
  { value: 'UTC', label: 'UTC — Coordinated Universal Time', offset: '+00:00' },

  // Americas
  { value: 'America/New_York',    label: 'Eastern Time (US & Canada)',     offset: '-05:00' },
  { value: 'America/Chicago',     label: 'Central Time (US & Canada)',     offset: '-06:00' },
  { value: 'America/Denver',      label: 'Mountain Time (US & Canada)',    offset: '-07:00' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)',     offset: '-08:00' },
  { value: 'America/Anchorage',   label: 'Alaska',                         offset: '-09:00' },
  { value: 'Pacific/Honolulu',    label: 'Hawaii',                         offset: '-10:00' },
  { value: 'America/Toronto',     label: 'Eastern Time (Canada)',          offset: '-05:00' },
  { value: 'America/Vancouver',   label: 'Pacific Time (Canada)',          offset: '-08:00' },
  { value: 'America/Sao_Paulo',   label: 'Brasilia',                       offset: '-03:00' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires',        offset: '-03:00' },
  { value: 'America/Mexico_City', label: 'Mexico City',                    offset: '-06:00' },
  { value: 'America/Bogota',      label: 'Bogota, Lima, Quito',           offset: '-05:00' },
  { value: 'America/Santiago',    label: 'Santiago',                       offset: '-04:00' },
  { value: 'America/Caracas',     label: 'Caracas',                        offset: '-04:00' },

  // Europe
  { value: 'Europe/London',       label: 'London',                         offset: '+00:00' },
  { value: 'Europe/Paris',        label: 'Paris, Brussels, Amsterdam',     offset: '+01:00' },
  { value: 'Europe/Berlin',       label: 'Berlin, Frankfurt, Zurich',      offset: '+01:00' },
  { value: 'Europe/Rome',         label: 'Rome, Madrid, Vienna',           offset: '+01:00' },
  { value: 'Europe/Amsterdam',    label: 'Amsterdam',                      offset: '+01:00' },
  { value: 'Europe/Stockholm',    label: 'Stockholm, Oslo, Copenhagen',    offset: '+01:00' },
  { value: 'Europe/Athens',       label: 'Athens, Helsinki, Bucharest',    offset: '+02:00' },
  { value: 'Europe/Istanbul',     label: 'Istanbul',                       offset: '+03:00' },
  { value: 'Europe/Moscow',       label: 'Moscow, St. Petersburg',         offset: '+03:00' },
  { value: 'Europe/Warsaw',       label: 'Warsaw, Prague',                 offset: '+01:00' },
  { value: 'Europe/Kyiv',         label: 'Kyiv',                           offset: '+02:00' },
  { value: 'Europe/Lisbon',       label: 'Lisbon',                         offset: '+00:00' },

  // Africa
  { value: 'Africa/Cairo',        label: 'Cairo',                          offset: '+02:00' },
  { value: 'Africa/Lagos',        label: 'Lagos, Nairobi',                 offset: '+01:00' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg',                   offset: '+02:00' },
  { value: 'Africa/Casablanca',   label: 'Casablanca',                     offset: '+01:00' },

  // Middle East
  { value: 'Asia/Dubai',          label: 'Dubai, Abu Dhabi',               offset: '+04:00' },
  { value: 'Asia/Riyadh',         label: 'Riyadh',                         offset: '+03:00' },
  { value: 'Asia/Kuwait',         label: 'Kuwait, Baghdad',                offset: '+03:00' },
  { value: 'Asia/Tehran',         label: 'Tehran',                         offset: '+03:30' },
  { value: 'Asia/Jerusalem',      label: 'Jerusalem',                      offset: '+02:00' },

  // Asia
  { value: 'Asia/Kolkata',        label: 'India Standard Time',            offset: '+05:30' },
  { value: 'Asia/Karachi',        label: 'Karachi, Islamabad',             offset: '+05:00' },
  { value: 'Asia/Dhaka',          label: 'Dhaka',                          offset: '+06:00' },
  { value: 'Asia/Colombo',        label: 'Sri Lanka',                      offset: '+05:30' },
  { value: 'Asia/Kathmandu',      label: 'Kathmandu',                      offset: '+05:45' },
  { value: 'Asia/Almaty',         label: 'Almaty',                         offset: '+06:00' },
  { value: 'Asia/Bangkok',        label: 'Bangkok, Hanoi, Jakarta',        offset: '+07:00' },
  { value: 'Asia/Singapore',      label: 'Singapore, Kuala Lumpur',        offset: '+08:00' },
  { value: 'Asia/Hong_Kong',      label: 'Hong Kong',                      offset: '+08:00' },
  { value: 'Asia/Shanghai',       label: 'China Standard Time',            offset: '+08:00' },
  { value: 'Asia/Tokyo',          label: 'Tokyo, Osaka, Sapporo',          offset: '+09:00' },
  { value: 'Asia/Seoul',          label: 'Seoul',                          offset: '+09:00' },
  { value: 'Asia/Manila',         label: 'Manila',                         offset: '+08:00' },
  { value: 'Asia/Jakarta',        label: 'Jakarta',                        offset: '+07:00' },
  { value: 'Asia/Taipei',         label: 'Taipei',                         offset: '+08:00' },

  // Pacific / Oceania
  { value: 'Australia/Sydney',    label: 'Sydney, Canberra, Melbourne',    offset: '+10:00' },
  { value: 'Australia/Brisbane',  label: 'Brisbane',                       offset: '+10:00' },
  { value: 'Australia/Perth',     label: 'Perth',                          offset: '+08:00' },
  { value: 'Australia/Adelaide',  label: 'Adelaide',                       offset: '+09:30' },
  { value: 'Pacific/Auckland',    label: 'Auckland, Wellington',           offset: '+12:00' },
  { value: 'Pacific/Fiji',        label: 'Fiji',                           offset: '+12:00' },
];
