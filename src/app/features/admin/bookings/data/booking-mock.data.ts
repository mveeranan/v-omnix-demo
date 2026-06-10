import {
  BookingBranch,
  BookingDetail,
  BookingListItem,
  BookingServiceOption,
  BookingStaffMember,
  BookingStatus,
  PaymentStatus
} from '../models/booking.model';
import { buildTimeline } from '../utils/booking-timeline.util';

export const MOCK_BRANCHES: BookingBranch[] = [
  { id: 'br-1', name: 'Downtown Studio' },
  { id: 'br-2', name: 'Westside Branch' },
  { id: 'br-3', name: 'Harbor Location' }
];

export const MOCK_SERVICES: BookingServiceOption[] = [
  { id: 'svc-1', name: 'Classic Haircut', durationMinutes: 45, price: 35, category: 'Hair' },
  { id: 'svc-2', name: 'Beard Trim & Shape', durationMinutes: 30, price: 22, category: 'Grooming' },
  { id: 'svc-3', name: 'Full Color Treatment', durationMinutes: 120, price: 95, category: 'Color' },
  { id: 'svc-4', name: 'Deep Conditioning', durationMinutes: 60, price: 48, category: 'Treatment' },
  { id: 'svc-5', name: 'Bridal Styling', durationMinutes: 90, price: 120, category: 'Special' },
  { id: 'svc-6', name: 'Kids Cut', durationMinutes: 25, price: 18, category: 'Hair' }
];

export const MOCK_STAFF: BookingStaffMember[] = [
  {
    id: 'st-1',
    name: 'Alex Morgan',
    role: 'Senior Stylist',
    branch: 'Downtown Studio',
    initials: 'AM',
    avatarColor: 'bg-[var(--accent)]'
  },
  {
    id: 'st-2',
    name: 'Jordan Lee',
    role: 'Color Specialist',
    branch: 'Westside Branch',
    initials: 'JL',
    avatarColor: 'bg-violet-500'
  },
  {
    id: 'st-3',
    name: 'Sam Rivera',
    role: 'Barber',
    branch: 'Downtown Studio',
    initials: 'SR',
    avatarColor: 'bg-emerald-500'
  },
  {
    id: 'st-4',
    name: 'Taylor Kim',
    role: 'Stylist',
    branch: 'Harbor Location',
    initials: 'TK',
    avatarColor: 'bg-amber-500'
  },
  {
    id: 'st-5',
    name: 'Casey Brooks',
    role: 'Junior Stylist',
    branch: 'Westside Branch',
    initials: 'CB',
    avatarColor: 'bg-sky-500'
  }
];

export const MOCK_TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00'
];

const TAX_RATE = 0.08;

function createBooking(
  id: number,
  customerName: string,
  phone: string,
  serviceId: string,
  branchId: string,
  staffId: string | undefined,
  daysOffset: number,
  hour: number,
  minute: number,
  status: BookingStatus,
  paymentStatus: PaymentStatus
): BookingDetail {
  const service = MOCK_SERVICES.find((s) => s.id === serviceId)!;
  const branch = MOCK_BRANCHES.find((b) => b.id === branchId)!;
  const staff = staffId ? MOCK_STAFF.find((s) => s.id === staffId) : undefined;
  const scheduledAt = new Date();
  scheduledAt.setDate(scheduledAt.getDate() + daysOffset);
  scheduledAt.setHours(hour, minute, 0, 0);
  const createdAt = new Date(scheduledAt);
  createdAt.setDate(createdAt.getDate() - 2);

  const price = service.price;
  const taxAmount = Math.round(price * TAX_RATE * 100) / 100;
  const totalAmount = Math.round((price + taxAmount) * 100) / 100;

  return {
    id: `bk-${id}`,
    displayId: `BK-${String(id).padStart(4, '0')}`,
    customerName,
    phone,
    email: `${customerName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
    serviceId,
    serviceName: service.name,
    branchId,
    branchName: branch.name,
    staffId,
    staffName: staff?.name,
    scheduledAt,
    status,
    paymentStatus,
    durationMinutes: service.durationMinutes,
    price,
    notes: id % 3 === 0 ? 'Customer prefers quiet environment.' : undefined,
    taxRate: TAX_RATE,
    taxAmount,
    totalAmount,
    timeline: buildTimeline(status, createdAt)
  };
}

export const MOCK_BOOKING_DETAILS: BookingDetail[] = [
  createBooking(1, 'Emma Wilson', '+1 555-0101', 'svc-1', 'br-1', 'st-1', 0, 10, 0, 'confirmed', 'paid'),
  createBooking(2, 'James Carter', '+1 555-0102', 'svc-2', 'br-1', 'st-3', 0, 14, 30, 'in-progress', 'paid'),
  createBooking(3, 'Sophia Martinez', '+1 555-0103', 'svc-3', 'br-2', 'st-2', 1, 11, 0, 'pending', 'pending'),
  createBooking(4, 'Liam Thompson', '+1 555-0104', 'svc-4', 'br-3', 'st-4', 1, 15, 0, 'assigned', 'partial'),
  createBooking(5, 'Olivia Brown', '+1 555-0105', 'svc-5', 'br-1', 'st-1', 2, 9, 30, 'confirmed', 'pending'),
  createBooking(6, 'Noah Davis', '+1 555-0106', 'svc-6', 'br-2', undefined, 0, 16, 0, 'pending', 'pending'),
  createBooking(7, 'Ava Miller', '+1 555-0107', 'svc-1', 'br-1', 'st-3', -1, 11, 30, 'completed', 'paid'),
  createBooking(8, 'Ethan Garcia', '+1 555-0108', 'svc-2', 'br-3', 'st-4', -2, 13, 0, 'completed', 'paid'),
  createBooking(9, 'Mia Rodriguez', '+1 555-0109', 'svc-3', 'br-2', 'st-2', 3, 10, 0, 'confirmed', 'paid'),
  createBooking(10, 'Lucas Anderson', '+1 555-0110', 'svc-4', 'br-1', 'st-1', -3, 14, 0, 'cancelled', 'refunded'),
  createBooking(11, 'Charlotte Lee', '+1 555-0111', 'svc-1', 'br-2', 'st-5', 4, 9, 0, 'pending', 'pending'),
  createBooking(12, 'Henry White', '+1 555-0112', 'svc-5', 'br-3', 'st-4', 5, 12, 0, 'confirmed', 'partial'),
  createBooking(13, 'Amelia Harris', '+1 555-0113', 'svc-6', 'br-1', 'st-3', 0, 11, 0, 'assigned', 'pending'),
  createBooking(14, 'Benjamin Clark', '+1 555-0114', 'svc-2', 'br-2', 'st-2', 6, 15, 30, 'pending', 'pending'),
  createBooking(15, 'Harper Lewis', '+1 555-0115', 'svc-1', 'br-3', 'st-4', 7, 10, 30, 'confirmed', 'paid'),
  createBooking(16, 'Daniel Walker', '+1 555-0116', 'svc-4', 'br-1', 'st-1', -5, 9, 0, 'completed', 'paid'),
  createBooking(17, 'Ella Hall', '+1 555-0117', 'svc-3', 'br-2', 'st-2', 8, 13, 0, 'pending', 'pending'),
  createBooking(18, 'Matthew Young', '+1 555-0118', 'svc-5', 'br-1', undefined, 9, 11, 0, 'pending', 'pending'),
  createBooking(19, 'Scarlett King', '+1 555-0119', 'svc-1', 'br-3', 'st-4', 10, 14, 0, 'confirmed', 'paid'),
  createBooking(20, 'Jack Wright', '+1 555-0120', 'svc-2', 'br-2', 'st-5', -1, 16, 30, 'in-progress', 'paid'),
  createBooking(21, 'Grace Scott', '+1 555-0121', 'svc-6', 'br-1', 'st-3', 11, 10, 0, 'pending', 'pending'),
  createBooking(22, 'Leo Green', '+1 555-0122', 'svc-4', 'br-3', 'st-4', 12, 15, 0, 'assigned', 'pending'),
  createBooking(23, 'Chloe Adams', '+1 555-0123', 'svc-1', 'br-2', 'st-2', 13, 9, 30, 'confirmed', 'paid'),
  createBooking(24, 'Ryan Baker', '+1 555-0124', 'svc-3', 'br-1', 'st-1', 14, 11, 0, 'pending', 'pending'),
  createBooking(25, 'Zoe Nelson', '+1 555-0125', 'svc-5', 'br-3', 'st-4', 15, 13, 30, 'confirmed', 'partial')
];

export function toListItem(detail: BookingDetail): BookingListItem {
  const { timeline: _t, notes: _n, taxRate: _tr, taxAmount: _ta, totalAmount: _to, ...item } = detail;
  return item;
}
