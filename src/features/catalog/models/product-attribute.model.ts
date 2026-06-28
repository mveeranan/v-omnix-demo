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

export interface SaveProductAttributeRequest {
  tenantId: string;
  name: string;
  values: string[];
}
