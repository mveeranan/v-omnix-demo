import { PhoneNumberValue } from '../../../../shared/models/phone-number.model';
import type { PaymentMethod } from './payment-method.model';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'refunded';

export type PaymentTiming = 'pay-later' | 'pay-now';

export type { PaymentMethod } from './payment-method.model';
export { PaymentMethodType } from './payment-method.model';

export type CalendarViewMode = 'month' | 'week' | 'day';

export type DateRangeFilter = 'all' | 'today' | 'week' | 'month' | 'custom';

export interface BookingServiceOption {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  category?: string;
}

export interface BookingStaffMember {
  id: string;
  name: string;
  role: string;
  branch: string;
  initials: string;
  avatarColor: string;
}

export interface BookingBranch {
  id: string;
  name: string;
}

export interface BookingListItem {
  id: string;
  displayId: string;
  customerName: string;
  phone: string;
  email?: string;
  serviceId: string;
  serviceName: string;
  branchId: string;
  branchName: string;
  staffId?: string;
  staffName?: string;
  scheduledAt: Date;
  scheduledEndAt?: Date;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  durationMinutes: number;
  price: number;
}

export interface TimelineEvent {
  key: 'created' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  label: string;
  timestamp?: Date;
  completed: boolean;
  active: boolean;
}

export interface BookingDetail extends BookingListItem {
  notes?: string;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paymentTiming?: PaymentTiming;
  paymentMethod?: PaymentMethod;
  receiptFileName?: string;
  receiptDocumentId?: string;
  timeline: TimelineEvent[];
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export interface BookingFilters {
  search: string;
  status: BookingStatus | 'all';
  dateRange: DateRangeFilter;
  serviceId: string | 'all';
  staffId: string | 'all';
}

export interface BookingWizardDraft {
  branchId: string;
  serviceIds: string[];
  customerName: string;
  phone: PhoneNumberValue;
  email: string;
  notes: string;
  scheduledDate: string;
  scheduledTime: string;
  paymentTiming: PaymentTiming;
  paymentMethod: PaymentMethod;
  receiptFileName: string;
  receiptDocumentId: string;
}

export const DEFAULT_BOOKING_FILTERS: BookingFilters = {
  search: '',
  status: 'all',
  dateRange: 'all',
  serviceId: 'all',
  staffId: 'all'
};

/** Payload shape for create-booking API (datetimes in UTC). */
export interface WizardBookingSubmitPayload {
  branchId: string;
  serviceIds: string[];
  customerName: string;
  email: string | null;
  phoneNumber: string;
  startDateTimeUtc: string;
  endDateTimeUtc: string;
  notes?: string | null;
  paymentTiming: PaymentTiming;
  paymentMethod: PaymentMethod;
  paymentMethodType: number;
  receiptDocumentId?: string | null;
}

/** Aggregated wizard fields carried across steps 1–3+. */
export interface WizardBookingCapture {
  branchId: string;
  serviceIds: string[];
  serviceNames: string;
  totalDurationMinutes: number;
  totalPrice: number;
  customerName: string;
  email: string;
  phoneNumber: string | null;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  startDateTimeLocal: string;
  endDateTimeLocal: string;
  startDateTimeUtc: string;
  endDateTimeUtc: string;
  isScheduleComplete: boolean;
}

export const DEFAULT_WIZARD_DRAFT: BookingWizardDraft = {
  branchId: '',
  serviceIds: [],
  customerName: '',
  phone: { dialCode: '', nationalNumber: '' },
  email: '',
  notes: '',
  scheduledDate: '',
  scheduledTime: '',
  paymentTiming: 'pay-later',
  paymentMethod: 'cash',
  receiptFileName: '',
  receiptDocumentId: ''
};
