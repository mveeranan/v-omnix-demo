export interface CustomerAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  currency: string;
  lastOrderDate: string;
  signupDate: string;
  addresses: CustomerAddress[];
  notes: { id: string; text: string; at: string }[];
}

export interface CustomerListFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CustomerListResult {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
}
