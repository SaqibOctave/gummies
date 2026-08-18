import { httpClient } from './httpClient'
import type { PaginatedResult } from '@/types/pagination'
import type { Order, OrderDetail, OrderStatus } from '@/types/order'

export interface ListOrdersParams {
  page?: number
  limit?: number
  status?: OrderStatus | ''
  search?: string
}

function toQueryString(params: object): string {
  const usp = new URLSearchParams()
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined && value !== '') usp.set(key, String(value))
  }
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}

export function list(params: ListOrdersParams = {}): Promise<PaginatedResult<Order>> {
  return httpClient.getPaginated<Order>(`/orders${toQueryString(params)}`)
}

export function getById(id: string): Promise<OrderDetail> {
  return httpClient.get<OrderDetail>(`/orders/${id}`)
}

export function updateStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
  return httpClient.patch<Order>(`/orders/${id}/status`, { status, note })
}
