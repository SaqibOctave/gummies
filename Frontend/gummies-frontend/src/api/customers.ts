import { httpClient } from './httpClient'
import type { PaginatedResult } from '@/types/pagination'
import type { Customer, CustomerOrderSummary } from '@/types/customer'

export interface ListCustomersParams {
  page?: number
  limit?: number
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

export function list(params: ListCustomersParams = {}): Promise<PaginatedResult<Customer>> {
  return httpClient.getPaginated<Customer>(`/customers${toQueryString(params)}`)
}

export function getById(id: string): Promise<Customer> {
  return httpClient.get<Customer>(`/customers/${id}`)
}

export function getOrderHistory(id: string): Promise<CustomerOrderSummary[]> {
  return httpClient.get<CustomerOrderSummary[]>(`/customers/${id}/orders`)
}
