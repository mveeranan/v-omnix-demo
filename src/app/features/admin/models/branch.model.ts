export interface BranchDto {
  id?: string;
  tenantId?: string;
  name: string;
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

export function createEmptyBranch(tenantId?: string): BranchDto {
  return {
    tenantId: tenantId ?? '',
    name: '',
    isActive: true,
    isPrimaryBranch: true
  };
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
