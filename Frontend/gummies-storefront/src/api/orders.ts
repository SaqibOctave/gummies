import { httpClient } from './httpClient'
import type { CreateOrderInput, Order, OrderWithItems } from '@/types/order'

// POST /orders returns { order, items } where `items` is a different
// camelCase shape (from the in-memory line items computed during checkout)
// than the snake_case order_items rows every other endpoint returns. This
// normalizes it to the same OrderItem shape lookup()/admin use, so a single
// display component can render either.
interface CheckoutLineItem {
  productId: string
  variantId: string
  productName: string
  variantName: string
  sku: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

interface CheckoutResponse {
  order: Order
  items: CheckoutLineItem[]
}

export async function checkout(input: CreateOrderInput): Promise<OrderWithItems> {
  const result = await httpClient.post<CheckoutResponse>('/orders', input)
  return {
    ...result.order,
    items: result.items.map((item) => ({
      product_name: item.productName,
      variant_name: item.variantName,
      sku: item.sku,
      unit_price: String(item.unitPrice),
      quantity: item.quantity,
      line_total: String(item.lineTotal),
    })),
  }
}

export function lookup(orderNumber: string, email: string): Promise<OrderWithItems> {
  return httpClient.get<OrderWithItems>(
    `/orders/lookup/${encodeURIComponent(orderNumber)}?email=${encodeURIComponent(email)}`
  )
}
