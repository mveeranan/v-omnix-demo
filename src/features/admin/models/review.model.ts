export interface Review {
  id: string;
  tenantId: string;
  productId?: string;
  productName?: string;
  author: string;
  email?: string;
  rating: number;
  title?: string;
  body: string;
  isPublished: boolean;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export function createEmptyReview(tenantId = 'default'): Omit<Review, 'id' | 'createdAt'> {
  return {
    tenantId,
    productId: '',
    productName: '',
    author: '',
    email: '',
    rating: 5,
    title: '',
    body: '',
    isPublished: true,
    isVerifiedPurchase: false
  };
}
