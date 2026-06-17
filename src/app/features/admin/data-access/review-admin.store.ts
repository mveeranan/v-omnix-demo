import { Review } from '../models/review.model';

const SEED: Review[] = [
  {
    id: 'rev-1',
    tenantId: 'default',
    productId: 'p1',
    productName: 'Classic Tee',
    author: 'Sarah Mitchell',
    email: 'sarah@example.com',
    rating: 5,
    title: 'Perfect fit',
    body: 'Soft fabric and true to size. Will buy again!',
    isPublished: true,
    isVerifiedPurchase: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'rev-2',
    tenantId: 'default',
    productId: 'p2',
    productName: 'Ceramic Mug',
    author: 'James Chen',
    email: 'james@example.com',
    rating: 4,
    title: 'Great quality',
    body: 'Beautiful glaze, holds heat well. Shipping was fast.',
    isPublished: true,
    isVerifiedPurchase: true,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: 'rev-3',
    tenantId: 'default',
    productId: 'p3',
    productName: 'Linen Tote',
    author: 'Emma Rodriguez',
    email: 'emma@example.com',
    rating: 3,
    title: 'Nice but small',
    body: 'Good craftsmanship but smaller than expected.',
    isPublished: false,
    isVerifiedPurchase: false,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
  }
];

class ReviewAdminStore {
  private reviews = structuredClone(SEED);

  getAll(): Review[] {
    return [...this.reviews].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getById(id: string): Review | undefined {
    return this.reviews.find((r) => r.id === id);
  }

  create(input: Omit<Review, 'id' | 'createdAt'>): Review {
    const item: Review = {
      ...input,
      id: `rev-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString()
    };
    this.reviews.push(item);
    return item;
  }

  update(id: string, patch: Partial<Review>): Review | null {
    const idx = this.reviews.findIndex((r) => r.id === id);
    if (idx < 0) return null;
    this.reviews[idx] = { ...this.reviews[idx], ...patch };
    return this.reviews[idx];
  }

  delete(id: string): boolean {
    const before = this.reviews.length;
    this.reviews = this.reviews.filter((r) => r.id !== id);
    return this.reviews.length < before;
  }

  replaceAll(items: Review[]): void {
    this.reviews = structuredClone(items);
  }
}

export const reviewAdminStore = new ReviewAdminStore();
