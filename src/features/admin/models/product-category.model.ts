export interface ProductCategoryDto {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  parentCategoryId?: string | null;
  displayOrder: number;
  isActive: boolean;
  children?: ProductCategoryDto[];
}

export function createEmptyProductCategory(tenantId = 'default'): Omit<ProductCategoryDto, 'id'> {
  return {
    tenantId,
    name: '',
    slug: '',
    description: '',
    parentCategoryId: null,
    displayOrder: 0,
    isActive: true
  };
}
