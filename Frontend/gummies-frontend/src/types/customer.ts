import type { OrderStatus } from './order'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  created_at: string
  updated_at: string
}

// Shape returned by GET /customers/:id/orders - a lighter projection than
// the full Order type used by the Orders module.
export interface CustomerOrderSummary {
  id: string
  order_number: string
  status: OrderStatus
  grand_total: string
  currency: string
  placed_at: string
}
