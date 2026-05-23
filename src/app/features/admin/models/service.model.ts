export interface ServiceDto {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  category?: string | null;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateServiceRequest {
  tenantId: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  category?: string | null;
  isActive: boolean;
}

export interface UpdateServiceRequest extends CreateServiceRequest {
  id: string;
}

export type ServiceFormMode = 'create' | 'edit';

export interface ServiceFormValue {
  name: string;
  description: string;
  durationMinutes: number | null;
  price: number | null;
  category: string;
  isActive: boolean;
}

export function createEmptyServiceFormValue(): ServiceFormValue {
  return {
    name: '',
    description: '',
    durationMinutes: 30,
    price: null,
    category: '',
    isActive: true
  };
}

export function serviceToFormValue(service: ServiceDto): ServiceFormValue {
  return {
    name: service.name ?? '',
    description: service.description ?? '',
    durationMinutes: service.durationMinutes ?? 30,
    price: service.price ?? null,
    category: service.category ?? '',
    isActive: service.isActive ?? true
  };
}

export function normalizeServiceDto(raw: unknown): ServiceDto | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const id = pickString(item['id'], item['Id']);
  const tenantId = pickString(item['tenantId'], item['TenantId']);
  const name = pickString(item['name'], item['Name']);

  if (!id || !tenantId || !name) {
    return null;
  }

  return {
    id,
    tenantId,
    name,
    description: pickOptionalString(item['description'], item['Description']) ?? null,
    durationMinutes: pickNumber(item['durationMinutes'], item['DurationMinutes']) ?? 0,
    price: pickNumber(item['price'], item['Price']) ?? 0,
    category: pickOptionalString(item['category'], item['Category']) ?? null,
    isActive: pickBoolean(item['isActive'], item['IsActive']) ?? true,
    createdAt: pickOptionalString(item['createdAt'], item['CreatedAt']) ?? null,
    updatedAt: pickOptionalString(item['updatedAt'], item['UpdatedAt']) ?? null
  };
}

export function normalizeServiceList(raw: unknown): ServiceDto[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item) => normalizeServiceDto(item)).filter((item): item is ServiceDto => item !== null);
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
