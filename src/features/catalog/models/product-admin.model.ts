import { ProductStatus } from './product-status.enum';

export interface ProductListItemDto {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  status: ProductStatus;
  categoryId: string;
  categoryName: string;
  brandId: string | null;
  brandName: string | null;
  primaryImageUrl: string | null;
  variantCount: number;
  isFeatured: boolean;
}

export interface ProductListResponse {
  items: ProductListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ProductListFilters {
  tenantId?: string;
  status?: ProductStatus;
  categoryId?: string;
  brandId?: string;
  tagId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductVariantAttributeDto {
  attributeId: string;
  attributeName: string;
  valueId: string;
  value: string;
}

export interface ProductVariantDto {
  id: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  barcode: string | null;
  weight: number | null;
  isActive: boolean;
  attributes: ProductVariantAttributeDto[];
}

export interface ProductImageDto {
  id: string;
  documentId: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface InventoryItemDto {
  id: string;
  productId: string;
  variantId?: string | null;
  variantSku?: string | null;
  quantityAvailable: number;
  quantityReserved: number;
  lowStockThreshold: number;
}

export interface ProductDetailDto {
  id: string;
  tenantId: string;
  categoryId: string;
  categoryName: string;
  brandId: string | null;
  brandName: string | null;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  weight: number | null;
  trackInventory: boolean;
  status: ProductStatus;
  variants: ProductVariantDto[];
  images: ProductImageDto[];
  tagIds: string[];
  inventory: InventoryItemDto[];
}

export interface SaveProductRequest {
  tenantId: string;
  categoryId: string;
  brandId: string | null;
  name: string;
  shortDescription: string | null;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  weight: number | null;
  trackInventory: boolean;
  status: ProductStatus;
}

export interface PatchProductStatusRequest {
  tenantId: string;
  status: ProductStatus;
}

export interface BulkUpdateProductStatusRequest {
  tenantId: string;
  productIds: string[];
  status: ProductStatus;
}

export interface BulkProductStatusFailure {
  productId: string;
  error: string;
}

export interface BulkUpdateProductStatusResult {
  successCount: number;
  failureCount: number;
  failures: BulkProductStatusFailure[];
}

export interface ProductVariantAttributeInput {
  attributeId: string;
  attributeName: string;
  valueId: string;
  value: string;
}

export interface SaveProductVariantRequest {
  tenantId: string;
  price: number;
  compareAtPrice?: number | null;
  barcode?: string | null;
  weight?: number | null;
  isActive: boolean;
  attributes: ProductVariantAttributeInput[];
}

export interface DeleteProductVariantRequest {
  tenantId: string;
}

export interface SaveProductImageItem {
  id: string | null;
  documentId: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface SaveProductImagesRequest {
  tenantId: string;
  images: SaveProductImageItem[];
}

export interface CreateInventoryRequest {
  tenantId: string;
  variantId: string | null;
  quantityAvailable: number;
  lowStockThreshold: number;
}

export interface UpdateInventoryRequest {
  tenantId: string;
  quantityAvailable: number;
  lowStockThreshold: number;
}

export interface DeleteInventoryRequest {
  tenantId: string;
}

export interface SaveProductTagsRequest {
  tenantId: string;
  tagIds: string[];
}

export interface PendingImageUpload {
  file: File;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
}

/** Source data for duplicate-product flow. */
export interface ProductDuplicateVariantSource {
  sourceVariantId: string;
  price: number;
  compareAtPrice: number | null;
  barcode: string | null;
  weight: number | null;
  isActive: boolean;
  attributes: ProductVariantAttributeInput[];
}

export interface ProductDuplicateInventorySource {
  sourceVariantId: string | null;
  quantityAvailable: number;
  lowStockThreshold: number;
}

export interface ProductSavePayload {
  productId?: string;
  core: SaveProductRequest;
  variants: ProductDuplicateVariantSource[];
  existingImages: SaveProductImageItem[];
  pendingImages: PendingImageUpload[];
  inventory: ProductDuplicateInventorySource[];
  tagIds: string[];
  publish: boolean;
}

export function productDetailStockTotal(product: ProductDetailDto): number {
  if (!product.trackInventory) return Infinity;
  if (product.inventory.length === 0) return 0;
  return product.inventory.reduce((sum, item) => sum + item.quantityAvailable, 0);
}

export function productListItemStock(product: ProductListItemDto): number | null {
  return product.variantCount > 0 ? null : null;
}
