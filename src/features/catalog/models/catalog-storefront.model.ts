export interface CatalogProductListItemDto {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  shortDescription: string | null;
  primaryImageUrl: string | null;
  brandName: string | null;
  tags: string[];
}

export interface CatalogProductImageDto {
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface CatalogProductVariantDto {
  id: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  attributes: Record<string, string>;
  stockAvailable: number;
}

export interface CatalogProductDetailDto {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  brandName: string | null;
  categoryName: string | null;
  images: CatalogProductImageDto[];
  variants: CatalogProductVariantDto[];
  tags: string[];
  trackInventory: boolean;
  stockAvailable: number;
  // ProductType metadata for variant attribute rendering
  productTypeId?: string;
  productTypeName?: string;
  productTypeAttributes?: ProductTypeAttributeDto[];
}

export interface ProductTypeAttributeDto {
  id: string;
  name: string;
  dataType: string; // Text, Number, Dropdown (from ProductAttributeDataType enum)
  isRequired: boolean;
  displayOrder: number;
  possibleValues: string[]; // Available values for this attribute
}

export interface CatalogCategoryDto {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  children: CatalogCategoryDto[];
}

export interface CatalogBrandDto {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export type CatalogSortOption = 'newest' | 'price-asc' | 'price-desc' | 'name' | 'bestselling';

export interface CatalogProductListFilters {
  categorySlug?: string;
  brandSlug?: string;
  tagSlug?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: CatalogSortOption;
  onSale?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CatalogProductListResult {
  items: CatalogProductListItemDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CatalogDealOfWeekDto {
  enabled: boolean;
  title: string | null;
  badgeText: string | null;
  endDateUtc: string | null;
  product: CatalogProductListItemDto | null;
}

export function catalogDiscountPercent(product: {
  price: number;
  compareAtPrice: number | null;
}): number | null {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) {
    return null;
  }
  return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
}

export function catalogInStock(product: {
  trackInventory: boolean;
  stockAvailable: number;
  variants?: CatalogProductVariantDto[];
}): boolean {
  if (!product.trackInventory) return true;
  if (product.variants && product.variants.length > 0) {
    return product.variants.some((v) => v.stockAvailable > 0);
  }
  return product.stockAvailable > 0;
}

export function catalogPrimaryImage(product: CatalogProductListItemDto | CatalogProductDetailDto): string {
  if ('primaryImageUrl' in product && product.primaryImageUrl) {
    return product.primaryImageUrl;
  }
  if ('images' in product && product.images.length > 0) {
    const primary = product.images.find((i) => i.isPrimary) ?? product.images[0];
    return primary.url;
  }
  return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
}
