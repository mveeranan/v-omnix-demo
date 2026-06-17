import { BrandDto } from '../models/brand.model';

const SEED: BrandDto[] = [
  {
    id: 'brand-1',
    tenantId: 'default',
    name: 'WorkOrbit Basics',
    slug: 'workorbit-basics',
    logoDocumentId: null,
    logoUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80',
    description: 'House brand essentials',
    isActive: true
  },
  {
    id: 'brand-2',
    tenantId: 'default',
    name: 'Urban Craft',
    slug: 'urban-craft',
    logoDocumentId: null,
    logoUrl: '',
    description: 'Handmade urban goods',
    isActive: true
  }
];

class BrandStore {
  private brands = structuredClone(SEED);

  getAll(): BrandDto[] {
    return [...this.brands].sort((a, b) => a.name.localeCompare(b.name));
  }

  getById(id: string): BrandDto | undefined {
    return this.brands.find((b) => b.id === id);
  }

  create(input: Omit<BrandDto, 'id'>): BrandDto {
    const item: BrandDto = {
      ...input,
      id: `brand-${crypto.randomUUID().slice(0, 8)}`
    };
    this.brands.push(item);
    return item;
  }

  update(id: string, patch: Partial<BrandDto>): BrandDto | null {
    const idx = this.brands.findIndex((b) => b.id === id);
    if (idx < 0) return null;
    this.brands[idx] = { ...this.brands[idx], ...patch };
    return this.brands[idx];
  }

  delete(id: string): boolean {
    const before = this.brands.length;
    this.brands = this.brands.filter((b) => b.id !== id);
    return this.brands.length < before;
  }

  replaceAll(items: BrandDto[]): void {
    this.brands = structuredClone(items);
  }
}

export const brandStore = new BrandStore();
