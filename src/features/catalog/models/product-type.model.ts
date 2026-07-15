export enum ProductAttributeDataType {
  Text = 1,
  Number = 2,
  Dropdown = 3
}

export interface ProductTypeAttributeDto {
  id: string;
  name: string;
  dataType: ProductAttributeDataType;
  isRequired: boolean;
  displayOrder: number;
  possibleValues: string[];
}

export interface ProductTypeDto {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  attributes: ProductTypeAttributeDto[];
}

export interface SaveProductTypeAttributeRequest {
  id?: string | null;
  name: string;
  dataType: ProductAttributeDataType;
  isRequired: boolean;
  displayOrder: number;
  possibleValues: string[];
}

export interface SaveProductTypeRequest {
  tenantId: string;
  name: string;
  description: string | null;
  attributes: SaveProductTypeAttributeRequest[];
}
