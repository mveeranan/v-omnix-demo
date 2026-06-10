/** Mirrors backend PaymentMethodType enum. */
export enum PaymentMethodType {
  Cash = 1,
  UPI = 2,
  BankTransfer = 3
}

export type PaymentMethod = 'cash' | 'upi' | 'bank-transfer';

export interface TenantPaymentInstructions {
  upiId: string;
  upiQrImageUrl: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
}

export function paymentMethodToType(method: PaymentMethod): PaymentMethodType {
  switch (method) {
    case 'cash':
      return PaymentMethodType.Cash;
    case 'upi':
      return PaymentMethodType.UPI;
    case 'bank-transfer':
      return PaymentMethodType.BankTransfer;
  }
}

export function paymentMethodRequiresReceipt(method: PaymentMethod): boolean {
  return method === 'upi' || method === 'bank-transfer';
}

export function formatPaymentMethodLabel(method: PaymentMethod | undefined): string {
  switch (method) {
    case 'cash':
      return 'Cash';
    case 'upi':
      return 'UPI';
    case 'bank-transfer':
      return 'Bank Transfer';
    default:
      return '';
  }
}
