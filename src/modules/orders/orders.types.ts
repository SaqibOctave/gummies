import { OrderStatus } from '../../common/constants/orderStatus';

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderRecord {
  id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  shipping_address: Address;
  billing_address: Address | null;
  currency: string;
  subtotal: string;
  discount_total: string;
  shipping_total: string;
  tax_total: string;
  grand_total: string;
  customer_notes: string | null;
  internal_notes: string | null;
  placed_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItemRecord {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_name: string;
  sku: string;
  unit_price: string;
  quantity: number;
  line_total: string;
  created_at: Date;
}

export interface OrderStatusHistoryRecord {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  note: string | null;
  changed_by: string | null;
  created_at: Date;
}

export interface CreateOrderItemInput {
  variantId: string;
  quantity: number;
}

export interface CreateOrderInput {
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  customerNotes?: string;
  items: CreateOrderItemInput[];
}
