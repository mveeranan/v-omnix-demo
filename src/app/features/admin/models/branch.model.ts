import { ServiceDto, normalizeServiceList } from './service.model';

export interface BranchWorkingDayDto {
  id?: string;
  branchId?: string;
  dayNumber: number;
  isDayOff: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

export interface BranchWorkingDayFormValue {
  dayNumber: number;
  isDayOff: boolean;
  startTime: string;
  endTime: string;
}

export const WORKING_DAY_LABELS: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday'
};

export interface BranchDto {
  id?: string;
  tenantId?: string;
  name: string;
  services?: ServiceDto[];
  serviceIds?: string[];
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  countryCode?: string | null;
  /** Present when API returns PascalCase JSON. */
  CountryCode?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phoneNumber?: string | null;
  email?: string | null;
  workingDays?: BranchWorkingDayDto[];
  isActive: boolean;
  isPrimaryBranch: boolean;
}

export interface BranchUpsertRequest {
  id?: string;
  tenantId: string;
  name: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  countryCode?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phoneNumber?: string | null;
  email?: string | null;
  workingDays: BranchWorkingDayDto[];
  isActive: boolean;
  isPrimaryBranch: boolean;
}

/** @deprecated Use BranchUpsertRequest */
export type BranchUpdateRequest = Omit<BranchUpsertRequest, 'id' | 'tenantId'>;

export type BranchFormMode = 'create' | 'edit';

export interface BranchFormValue {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  countryCode: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  phoneNumber: string;
  email: string;
  workingDays: BranchWorkingDayFormValue[];
  isActive: boolean;
  isPrimaryBranch: boolean;
}

export function createDefaultWorkingDaysFormValues(): BranchWorkingDayFormValue[] {
  return [1, 2, 3, 4, 5, 6, 7].map((dayNumber) => ({
    dayNumber,
    isDayOff: dayNumber >= 6,
    startTime: dayNumber < 6 ? '09:00' : '',
    endTime: dayNumber < 6 ? '18:00' : ''
  }));
}

export function createEmptyBranchFormValue(): BranchFormValue {
  return {
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    countryCode: '',
    postalCode: '',
    latitude: null,
    longitude: null,
    phoneNumber: '',
    email: '',
    workingDays: createDefaultWorkingDaysFormValues(),
    isActive: true,
    isPrimaryBranch: false
  };
}

export function workingDaysToFormValues(
  days: BranchWorkingDayDto[] | null | undefined
): BranchWorkingDayFormValue[] {
  const defaults = createDefaultWorkingDaysFormValues();
  if (!days?.length) {
    return defaults;
  }

  return defaults.map((defaultDay) => {
    const match = days.find((d) => d.dayNumber === defaultDay.dayNumber);
    if (!match) {
      return defaultDay;
    }
    return {
      dayNumber: match.dayNumber,
      isDayOff: match.isDayOff,
      startTime: match.isDayOff ? '' : timeSpanToInputValue(match.startTime),
      endTime: match.isDayOff ? '' : timeSpanToInputValue(match.endTime)
    };
  });
}

export function formWorkingDaysToApi(
  days: BranchWorkingDayFormValue[]
): BranchWorkingDayDto[] {
  return days.map((day) => ({
    dayNumber: day.dayNumber,
    isDayOff: day.isDayOff,
    startTime: day.isDayOff ? null : inputValueToTimeSpan(day.startTime),
    endTime: day.isDayOff ? null : inputValueToTimeSpan(day.endTime)
  }));
}

export function branchToFormValue(branch: BranchDto): BranchFormValue {
  return {
    name: branch.name ?? '',
    addressLine1: branch.addressLine1 ?? '',
    addressLine2: branch.addressLine2 ?? '',
    city: branch.city ?? '',
    countryCode: readBranchCountryCode(branch),
    postalCode: branch.postalCode ?? '',
    latitude: branch.latitude ?? null,
    longitude: branch.longitude ?? null,
    phoneNumber: branch.phoneNumber ?? '',
    email: branch.email ?? '',
    workingDays: workingDaysToFormValues(branch.workingDays),
    isActive: branch.isActive ?? true,
    isPrimaryBranch: branch.isPrimaryBranch ?? false
  };
}

export function formatBranchWorkingHoursSummary(
  workingDays: BranchWorkingDayDto[] | null | undefined
): string {
  if (!workingDays?.length) {
    return '—';
  }

  const openDays = workingDays.filter((d) => !d.isDayOff && d.startTime && d.endTime);
  if (openDays.length === 0) {
    return 'Closed';
  }

  const start = timeSpanToInputValue(openDays[0].startTime);
  const end = timeSpanToInputValue(openDays[0].endTime);
  const sameHours = openDays.every(
    (d) =>
      timeSpanToInputValue(d.startTime) === start && timeSpanToInputValue(d.endTime) === end
  );

  if (sameHours && openDays.length >= 5) {
    return `${formatTime12h(start)} – ${formatTime12h(end)}`;
  }

  return `${openDays.length} day(s) open`;
}

export function createEmptyBranch(tenantId?: string): BranchDto {
  return {
    tenantId: tenantId ?? '',
    name: '',
    isActive: true,
    isPrimaryBranch: true,
    workingDays: formWorkingDaysToApi(createDefaultWorkingDaysFormValues())
  };
}

export function getBranchAssignedServiceIds(branch: BranchDto | null | undefined): string[] {
  if (!branch) {
    return [];
  }

  if (branch.serviceIds?.length) {
    return branch.serviceIds.filter((id) => typeof id === 'string' && id.trim());
  }

  const services =
    branch.services ??
    (branch as unknown as Record<string, unknown>)['Services'];
  if (!Array.isArray(services)) {
    return [];
  }

  return services
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim();
      }
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>;
        const id = record['id'] ?? record['Id'];
        return typeof id === 'string' ? id.trim() : '';
      }
      return '';
    })
    .filter((id) => id.length > 0);
}

export function readBranchCountryCode(branch: BranchDto | null | undefined): string {
  if (!branch) {
    return '';
  }
  const value = branch.countryCode ?? branch.CountryCode ?? '';
  return typeof value === 'string' ? value.trim() : '';
}

export function pickPrimaryBranch(branches: BranchDto[]): BranchDto | null {
  if (!branches.length) return null;
  return branches.find((b) => b.isPrimaryBranch) ?? branches[0];
}

export function validateWorkingDaysForm(
  days: BranchWorkingDayFormValue[]
): string | null {
  for (const day of days) {
    if (day.isDayOff) {
      continue;
    }
    if (!day.startTime?.trim() || !day.endTime?.trim()) {
      const label = WORKING_DAY_LABELS[day.dayNumber] ?? `Day ${day.dayNumber}`;
      return `Set opening and closing times for ${label}, or mark it as a day off.`;
    }
    if (day.startTime >= day.endTime) {
      const label = WORKING_DAY_LABELS[day.dayNumber] ?? `Day ${day.dayNumber}`;
      return `Closing time must be after opening time for ${label}.`;
    }
  }
  return null;
}

function normalizeWorkingDay(raw: unknown): BranchWorkingDayDto | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const item = raw as Record<string, unknown>;
  const dayNumber = pickNumber(item['dayNumber'], item['DayNumber']);
  if (dayNumber === undefined || dayNumber < 1 || dayNumber > 7) {
    return null;
  }
  return {
    id: pickString(item['id'], item['Id']),
    branchId: pickString(item['branchId'], item['BranchId']),
    dayNumber,
    isDayOff: pickBoolean(item['isDayOff'], item['IsDayOff']) ?? false,
    startTime: pickOptionalString(item['startTime'], item['StartTime']) ?? null,
    endTime: pickOptionalString(item['endTime'], item['EndTime']) ?? null
  };
}

function normalizeWorkingDaysList(raw: unknown): BranchWorkingDayDto[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((item) => normalizeWorkingDay(item))
    .filter((item): item is BranchWorkingDayDto => item !== null);
}

export function normalizeBranchDto(raw: unknown): BranchDto | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const id = pickString(item['id'], item['Id']);
  const name = pickString(item['name'], item['Name']);

  if (!name) {
    return null;
  }

  const servicesRaw = item['services'] ?? item['Services'];
  const services = normalizeServiceList(servicesRaw);
  const serviceIdsRaw = item['serviceIds'] ?? item['ServiceIds'];
  const serviceIds = Array.isArray(serviceIdsRaw)
    ? serviceIdsRaw
        .map((id) => (typeof id === 'string' ? id.trim() : ''))
        .filter((id) => id.length > 0)
    : services.map((s) => s.id);

  const workingDays = normalizeWorkingDaysList(item['workingDays'] ?? item['WorkingDays']);

  return {
    id,
    tenantId: pickString(item['tenantId'], item['TenantId']),
    name,
    services,
    serviceIds,
    addressLine1: pickOptionalString(item['addressLine1'], item['AddressLine1']) ?? null,
    addressLine2: pickOptionalString(item['addressLine2'], item['AddressLine2']) ?? null,
    city: pickOptionalString(item['city'], item['City']) ?? null,
    countryCode: pickOptionalString(item['countryCode'], item['CountryCode']) ?? null,
    postalCode: pickOptionalString(item['postalCode'], item['PostalCode']) ?? null,
    latitude: pickNumber(item['latitude'], item['Latitude']) ?? null,
    longitude: pickNumber(item['longitude'], item['Longitude']) ?? null,
    phoneNumber: pickOptionalString(item['phoneNumber'], item['PhoneNumber']) ?? null,
    email: pickOptionalString(item['email'], item['Email']) ?? null,
    workingDays,
    isActive: pickBoolean(item['isActive'], item['IsActive']) ?? true,
    isPrimaryBranch: pickBoolean(item['isPrimaryBranch'], item['IsPrimaryBranch']) ?? false
  };
}

export function normalizeBranchList(raw: unknown): BranchDto[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item) => normalizeBranchDto(item)).filter((item): item is BranchDto => item !== null);
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function pickOptionalString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string') {
      return value.trim();
    }
  }
  return undefined;
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
}

function pickBoolean(...values: unknown[]): boolean | undefined {
  for (const value of values) {
    if (typeof value === 'boolean') {
      return value;
    }
  }
  return undefined;
}

/** Maps API TimeSpan ("HH:mm:ss" or "HH:mm") to HTML time input value. */
export function timeSpanToInputValue(value?: string | null): string {
  if (!value) return '';
  const parts = value.split(':');
  if (parts.length < 2) return '';
  return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
}

/** Maps HTML time input ("HH:mm") to API TimeSpan string. */
export function inputValueToTimeSpan(value?: string | null): string | null {
  if (!value?.trim()) return null;
  const [h, m] = value.split(':');
  if (!h || m === undefined) return null;
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`;
}

function formatTime12h(value: string): string {
  if (!value) {
    return '';
  }
  const [h, m] = value.split(':');
  const hour = Number.parseInt(h, 10);
  if (!Number.isFinite(hour)) {
    return value;
  }
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${suffix}`;
}
