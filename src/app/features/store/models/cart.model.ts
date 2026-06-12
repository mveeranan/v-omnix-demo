export interface CartLineItem {
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl: string;
  unitPrice: number;
  currency: string;
  quantity: number;
  variantId?: string;
  variantName?: string;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  currency: string;
}

export interface CheckoutCustomer {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
}

export interface CheckoutPayload {
  storeSlug: string;
  customer: CheckoutCustomer;
  items: CartLineItem[];
  subtotal: number;
  currency: string;
}

export interface CheckoutOrderResult {
  orderId: string;
  orderNumber: string;
  status: string;
}
