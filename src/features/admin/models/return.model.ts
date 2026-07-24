import { ReturnStatus } from '@shared/models/backend-enums';

export interface Return {
  id: string;
  orderId: string;
  orderItemId: string;
  customerId: string;
  reason: string;
  customerNotes?: string;
  status: ReturnStatus;
  requestedAt: string;
  approvedAt?: string;
  shippedAt?: string;
  receivedAt?: string;
  refundAmount: number;
  referenceNumber: string;
}

export interface CreateReturnRequest {
  orderId: string;
  orderItemId: string;
  reason: string;
  customerNotes?: string;
  storeSlug?: string;
}

export interface UpdateReturnStatusRequest {
  status: ReturnStatus;
  adminNotes?: string;
}
