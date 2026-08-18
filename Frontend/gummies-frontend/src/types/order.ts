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

// Mirrors Backend/src/common/constants/orderStatus.ts exactly, so the UI
// only ever offers status changes the backend will actually accept.
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'refunded'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
}

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

// Hex fills for SVG chart bars (a CSS class can't be read as a fill color).
// These are the validated CVD-safe categorical palette's slots 1-7, used in
// their documented sequential order - NOT hand-picked to match the Tailwind
// badge hues above, because reordering broke adjacency safety (validated
// with scripts/validate_palette.js from the dataviz skill: the muted-ink
// gray failed the chroma floor, and an ad-hoc pick put cancelled/refunded
// below the normal-vision distinguishability floor at 13.2 ΔE).
export const ORDER_STATUS_HEX: Record<OrderStatus, string> = {
  pending: '#2a78d6',
  confirmed: '#eb6834',
  processing: '#1baf7a',
  shipped: '#eda100',
  delivered: '#e87ba4',
  cancelled: '#008300',
  refunded: '#4a3aa7',
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
  customer_id: string
  status: OrderStatus
  contact_name: string
  contact_email: string
  contact_phone: string | null
  shipping_address: Address
  billing_address: Address | null
  currency: string
  subtotal: string
  discount_total: string
  shipping_total: string
  tax_total: string
  grand_total: string
  customer_notes: string | null
  internal_notes: string | null
  placed_at: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  product_name: string
  variant_name: string
  sku: string
  unit_price: string
  quantity: number
  line_total: string
  created_at: string
}

export interface OrderStatusHistoryEntry {
  id: string
  order_id: string
  from_status: OrderStatus | null
  to_status: OrderStatus
  note: string | null
  changed_by: string | null
  created_at: string
}

export interface OrderDetail extends Order {
  items: OrderItem[]
  statusHistory: OrderStatusHistoryEntry[]
}
