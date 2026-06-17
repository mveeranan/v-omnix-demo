import { CartLineItem, CheckoutCustomer } from '../../../store/models/cart.model';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'card' | 'upi' | 'razorpay' | 'cod' | 'wallet' | 'paypal';

export interface OrderLineItem extends CartLineItem {
  sku?: string;
  lineTotal: number;
}

export interface OrderTimelineEvent {
  id: string;
  label: string;
  at: string;
  completed: boolean;
}

export interface OrderNote {
  id: string;
  text: string;
  author: string;
  at: string;
}

export interface OrderAddress extends CheckoutCustomer {
  firstName?: string;
  lastName?: string;
  state?: string;
  zip?: string;
  addressLine2?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeSlug: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  items: OrderLineItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  couponCode?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  carrier?: string;
  timeline: OrderTimelineEvent[];
  notes: OrderNote[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderListFilters {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface OrderListResult {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
  revenueThisMonth: number;
  ordersThisMonth: number;
}
