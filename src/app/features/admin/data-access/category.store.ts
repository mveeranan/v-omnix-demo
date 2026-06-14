import { ProductCategoryDto } from '../models/product-category.model';

const SEED: ProductCategoryDto[] = [
  {
    id: 'cat-1',
    tenantId: 'default',
    name: 'Apparel',
    slug: 'apparel',
    description: 'Clothing and fashion',
    parentCategoryId: null,
    displayOrder: 0,
    isActive: true
  },
  {
    id: 'cat-2',
    tenantId: 'default',
    name: 'Home',
    slug: 'home',
    description: 'Home and living',
    parentCategoryId: null,
    displayOrder: 1,
    isActive: true
  },
  {
    id: 'cat-3',
    tenantId: 'default',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Bags, jewelry, and more',
    parentCategoryId: null,
    displayOrder: 2,
    isActive: true
  },
  {
    id: 'cat-4',
    tenantId: 'default',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Gadgets and devices',
    parentCategoryId: null,
    displayOrder: 3,
    isActive: true
  }
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

class CategoryStore {
  private categories = structuredClone(SEED);

  getAll(): ProductCategoryDto[] {
    return [...this.categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getById(id: string): ProductCategoryDto | undefined {
    return this.categories.find((c) => c.id === id);
  }

  getBySlug(slug: string): ProductCategoryDto | undefined {
    return this.categories.find((c) => c.slug === slug);
  }

  create(input: Omit<ProductCategoryDto, 'id'>): ProductCategoryDto {
    const item: ProductCategoryDto = {
      ...input,
      id: `cat-${crypto.randomUUID().slice(0, 8)}`,
      slug: input.slug || slugify(input.name)
    };
    this.categories.push(item);
    return item;
  }

  update(id: string, patch: Partial<ProductCategoryDto>): ProductCategoryDto | null {
    const idx = this.categories.findIndex((c) => c.id === id);
    if (idx < 0) return null;
    this.categories[idx] = { ...this.categories[idx], ...patch };
    return this.categories[idx];
  }

  delete(id: string): boolean {
    const before = this.categories.length;
    this.categories = this.categories.filter((c) => c.id !== id);
    return this.categories.length < before;
  }

  reorder(ids: string[]): void {
    ids.forEach((id, index) => {
      const cat = this.categories.find((c) => c.id === id);
      if (cat) cat.displayOrder = index;
    });
  }

  replaceAll(items: ProductCategoryDto[]): void {
    this.categories = structuredClone(items);
  }
}

export const categoryStore = new CategoryStore();
