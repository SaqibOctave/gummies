export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export const ORDER_STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  pending: 'bg-slate-100 text-slate-600',
  confirmed: 'bg-blue-50 text-blue-700',
  processing: 'bg-amber-50 text-amber-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
  refunded: 'bg-purple-50 text-purple-700',
}

export interface Address {
  fullName: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

export interface Order {
  id: string
  order_number: string
  status: OrderStatus
  contact_name: string
  contact_email: string
  contact_phone: string | null
  shipping_address: Address
  billing_address: Address | null
  currency: string
  subtotal: string
  shipping_total: string
  tax_total: string
  grand_total: string
  customer_notes: string | null
  placed_at: string
  created_at: string
}

// Normalized to the same field names regardless of whether the data came
// from checkout's response (which uses a different camelCase line-item
// shape) or the lookup/admin endpoints (snake_case order_items rows) - see
// api/orders.ts's checkout(), which maps checkout's response into this.
export interface OrderItem {
  product_name: string
  variant_name: string
  sku: string
  unit_price: string
  quantity: number
  line_total: string
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}

export interface CreateOrderItemInput {
  variantId: string
  quantity: number
}

export interface CreateOrderInput {
  contactName: string
  contactEmail: string
  contactPhone?: string
  shippingAddress: Address
  billingAddress?: Address
  customerNotes?: string
  items: CreateOrderItemInput[]
}
