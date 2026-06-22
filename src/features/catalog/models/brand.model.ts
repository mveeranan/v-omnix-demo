export interface BrandDto {
  id: string;
  tenantId: string;
  name: string;
  slug: string | null;
  description: string | null;
  isActive: boolean;
}

export interface SaveBrandRequest {
  tenantId: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export function createEmptyBrand(tenantId: string): SaveBrandRequest {
  return {
    tenantId,
    name: '',
    description: null,
    isActive: true
  };
}
