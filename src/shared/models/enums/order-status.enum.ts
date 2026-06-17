export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export type OrderPaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
