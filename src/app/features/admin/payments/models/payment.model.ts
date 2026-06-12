import { PaymentMethod, PaymentStatus } from '../../orders/models/order.model';

export interface PaymentTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  referenceId?: string;
  createdAt: string;
  refundAmount?: number;
}

export interface PaymentListFilters {
  search?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  page?: number;
  pageSize?: number;
}

export interface PaymentListResult {
  items: PaymentTransaction[];
  total: number;
  page: number;
  pageSize: number;
  totalReceivedThisMonth: number;
  pendingAmount: number;
  failedCount: number;
  totalRevenue: number;
}
