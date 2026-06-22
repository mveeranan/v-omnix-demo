export interface ProductAttributeValueDto {
  id: string;
  productAttributeId: string;
  value: string;
}

export interface ProductAttributeDto {
  id: string;
  tenantId: string;
  name: string;
  values: ProductAttributeValueDto[];
}

export interface UpsertProductAttributeItem {
  id: string | null;
  name: string;
  values: string[];
}

export interface UpsertProductAttributesRequest {
  tenantId: string;
  attributes: UpsertProductAttributeItem[];
}
