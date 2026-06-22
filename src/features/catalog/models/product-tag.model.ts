export interface ProductTagDto {
  id: string;
  tenantId: string;
  name: string;
  slug: string | null;
  isActive: boolean;
}

export interface CreateProductTagRequest {
  tenantId: string;
  name: string;
  isActive: boolean;
}

export function createEmptyProductTag(tenantId: string): CreateProductTagRequest {
  return {
    tenantId,
    name: '',
    isActive: true
  };
}
