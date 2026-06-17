import { ReturnStatus } from '../../../shared/models/backend-enums';

export interface ReturnLineItem {
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
}

export interface ReturnDto {
  id: string;
  tenantId: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  status: ReturnStatus;
  items: ReturnLineItem[];
  refundAmount: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
