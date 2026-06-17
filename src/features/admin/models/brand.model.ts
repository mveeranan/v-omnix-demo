export interface BrandDto {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  logoDocumentId?: string | null;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
}

export function createEmptyBrand(tenantId = 'default'): Omit<BrandDto, 'id'> {
  return {
    tenantId,
    name: '',
    slug: '',
    logoDocumentId: null,
    logoUrl: '',
    description: '',
    isActive: true
  };
}
