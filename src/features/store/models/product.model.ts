import {
  CatalogProductListFilters,
  CatalogProductListItemDto,
  CatalogProductListResult,
  CatalogProductDetailDto,
  CatalogSortOption
} from '@features/catalog/models/catalog-storefront.model';

/** Matches the backend's CatalogProductListQuery.Sort options exactly — no client-only sort modes. */
export type ProductSortOption = CatalogSortOption;

export interface ProductListFilters extends CatalogProductListFilters {
  /** Alias for `q` used by the shop page search box. */
  search?: string;
  /** Alias for `categorySlug` used by the shop sidebar. */
  category?: string;
  /** Alias for `brandSlug`. */
  brand?: string;
  /**
   * Client-only filters kept for the legacy `<app-product-filters>` component
   * (superseded by `msp-shop-sidebar` on the rebuilt shop page — slated for removal in R6).
   * Not sent to the API.
   */
  inStock?: boolean;
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
  return Object.values(variant.attributes).join(' / ') || variant.sku;
}
