import { StoreProduct } from '../models/product.model';
import { productCatalogStore } from './product-catalog.store';

export { BASE_PRODUCTS } from './product.seed';

export function getMockProductsForStore(_storeSlug: string): StoreProduct[] {
  return productCatalogStore.getAll();
}
