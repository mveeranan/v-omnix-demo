import { ServiceDto, normalizeServiceList } from './service.model';

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
  openingTime?: string | null;
  closingTime?: string | null;
  timeZone?: string | null;
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
  openingTime?: string | null;
  closingTime?: string | null;
  timeZone?: string | null;
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
  openingTime: string;
  closingTime: string;
  timeZone: string;
  isActive: boolean;
  isPrimaryBranch: boolean;
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
    openingTime: '',
    closingTime: '',
    timeZone: '',
    isActive: true,
    isPrimaryBranch: false
  };
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
    openingTime: timeSpanToInputValue(branch.openingTime),
    closingTime: timeSpanToInputValue(branch.closingTime),
    timeZone: branch.timeZone ?? '',
    isActive: branch.isActive ?? true,
    isPrimaryBranch: branch.isPrimaryBranch ?? false
  };
}

export function createEmptyBranch(tenantId?: string): BranchDto {
  return {
    tenantId: tenantId ?? '',
    name: '',
    isActive: true,
    isPrimaryBranch: true
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
    openingTime: pickOptionalString(item['openingTime'], item['OpeningTime']) ?? null,
    closingTime: pickOptionalString(item['closingTime'], item['ClosingTime']) ?? null,
    timeZone: pickOptionalString(item['timeZone'], item['TimeZone']) ?? null,
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
