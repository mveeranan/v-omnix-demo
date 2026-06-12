export type ProductStatus = 'active' | 'draft' | 'archived' | 'inactive';

export type ProductSortOption =
  | 'popular'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'reviews';

export interface ProductSeo {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  keywords: string[];
}

export interface ProductDimensions {
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
}

export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  galleryUrls: string[];
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number;
  currency: string;
  category: string;
  brand: string;
  sku?: string;
  featured: boolean;
  status: ProductStatus;
  stockQuantity: number;
  variants: ProductVariant[];
  rating?: number;
  reviewCount?: number;
  trackInventory?: boolean;
  lowStockThreshold?: number;
  tags?: string[];
  seo?: ProductSeo;
  dimensions?: ProductDimensions;
  taxable?: boolean;
  requiresShipping?: boolean;
  createdAt?: string;
}

export interface ProductListFilters {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  sort?: ProductSortOption;
  inStock?: boolean;
  onSale?: boolean;
  minRating?: number;
  status?: ProductStatus;
}

export interface ProductListResult {
  items: StoreProduct[];
  total: number;
  page: number;
  pageSize: number;
  categories: string[];
  brands: string[];
}

export function productDiscountPercent(product: StoreProduct): number | null {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) {
    return null;
  }
  return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
}

export function productInStock(product: StoreProduct): boolean {
  if (product.variants.length > 0) {
    return product.variants.some((v) => v.stockQuantity > 0);
  }
  return product.stockQuantity > 0;
}

export function productStockQuantity(product: StoreProduct): number {
  if (product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
  }
  return product.stockQuantity;
}
