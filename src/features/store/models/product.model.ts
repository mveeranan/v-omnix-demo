import {
  CatalogProductListFilters,
  CatalogProductListItemDto,
  CatalogProductListResult,
  CatalogProductDetailDto
} from '@features/catalog/models/catalog-storefront.model';

export type ProductSortOption =
  | 'popular'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'reviews';

export interface ProductListFilters extends CatalogProductListFilters {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSortOption;
  inStock?: boolean;
  onSale?: boolean;
  minRating?: number;
}

export interface ProductListResult extends CatalogProductListResult {
  categories: string[];
  brands: string[];
}

export type StoreProduct = CatalogProductListItemDto;
export type StoreProductDetail = CatalogProductDetailDto;

export type {
  CatalogProductListItemDto,
  CatalogProductDetailDto
} from '@features/catalog/models/catalog-storefront.model';

export {
  catalogDiscountPercent,
  catalogInStock,
  catalogPrimaryImage
} from '@features/catalog/models/catalog-storefront.model';

export function productDiscountPercent(product: {
  price: number;
  compareAtPrice: number | null;
}): number | null {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) {
    return null;
  }
  return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
}

export function productInStock(product: CatalogProductDetailDto): boolean {
  if (!product.trackInventory) return true;
  if (product.variants.length > 0) {
    return product.variants.some((v) => v.stockAvailable > 0);
  }
  return product.stockAvailable > 0;
}

export function variantLabel(variant: CatalogProductDetailDto['variants'][number]): string {
  return variant.attributes.map((a) => a.value).join(' / ') || variant.sku;
}
