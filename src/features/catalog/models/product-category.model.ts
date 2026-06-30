export interface ProductCategoryDto {
  id: string;
  tenantId: string;
  name: string;
  slug: string | null;
  description: string | null;
  parentCategoryId: string | null;
  displayOrder: number;
  isActive: boolean;
  imageDocumentId: string | null;
  imageDocumentUrl: string | null;
  children?: ProductCategoryDto[];
}

export interface CategoryImageAttachment {
  fileCategory: number; // 16 = CategoryImage
  files: Array<{ base64Content: string; fileName: string; contentType: string }>;
}

export interface SaveProductCategoryRequest {
  tenantId: string;
  name: string;
  description: string | null;
  parentCategoryId: string | null;
  displayOrder: number;
  isActive: boolean;
  attachments?: CategoryImageAttachment[];
}

export function createEmptyProductCategory(tenantId: string): SaveProductCategoryRequest {
  return {
    tenantId,
    name: '',
    description: null,
    parentCategoryId: null,
    displayOrder: 0,
    isActive: true,
    attachments: []
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
