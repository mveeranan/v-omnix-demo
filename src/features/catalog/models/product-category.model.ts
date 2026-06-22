export interface ProductCategoryDto {
  id: string;
  tenantId: string;
  name: string;
  slug: string | null;
  description: string | null;
  parentCategoryId: string | null;
  displayOrder: number;
  isActive: boolean;
  children?: ProductCategoryDto[];
}

export interface SaveProductCategoryRequest {
  tenantId: string;
  name: string;
  description: string | null;
  parentCategoryId: string | null;
  displayOrder: number;
  isActive: boolean;
}

export function createEmptyProductCategory(tenantId: string): SaveProductCategoryRequest {
  return {
    tenantId,
    name: '',
    description: null,
    parentCategoryId: null,
    displayOrder: 0,
    isActive: true
  };
}

export function flattenCategories(categories: ProductCategoryDto[]): ProductCategoryDto[] {
  const result: ProductCategoryDto[] = [];
  const walk = (items: ProductCategoryDto[]) => {
    for (const item of items) {
      result.push(item);
      if (item.children?.length) walk(item.children);
    }
  };
  walk(categories);
  return result;
}
