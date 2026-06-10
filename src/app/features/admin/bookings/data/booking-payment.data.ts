import { TenantPaymentInstructions } from '../models/payment-method.model';

/** Placeholder until tenant/branch payment settings API is wired. */
export const DEFAULT_TENANT_PAYMENT_INSTRUCTIONS: TenantPaymentInstructions = {
  upiId: 'business@upi',
  upiQrImageUrl:
    'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=business@upi&pn=WorkOrbit',
  bankName: 'Example National Bank',
  accountName: 'Work Orbit Pvt Ltd',
  accountNumber: '123456789012',
  ifsc: 'EXNB0001234'
};
