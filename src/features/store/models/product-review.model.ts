export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  text: string;
  createdAt: string;
  verifiedPurchase: boolean;
  helpfulYes: number;
  helpfulNo: number;
}
