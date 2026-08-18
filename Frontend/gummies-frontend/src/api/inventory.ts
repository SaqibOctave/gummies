import { httpClient } from './httpClient'
import type { PaginatedResult } from '@/types/pagination'
import type { InventoryMovement, InventoryRecord, InventoryWithProductInfo } from '@/types/inventory'

export interface ListInventoryParams {
  page?: number
  limit?: number
  lowStockOnly?: boolean
}

function toQueryString(params: object): string {
  const usp = new URLSearchParams()
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined && value !== '' && value !== false) usp.set(key, String(value))
  }
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}

export function list(params: ListInventoryParams = {}): Promise<PaginatedResult<InventoryWithProductInfo>> {
  return httpClient.getPaginated<InventoryWithProductInfo>(`/inventory${toQueryString(params)}`)
}

export function getByVariant(variantId: string): Promise<InventoryRecord> {
  return httpClient.get<InventoryRecord>(`/inventory/${variantId}`)
}

// Note: this endpoint does NOT return pagination meta (backend omits it),
// so callers only get an ordered slice, not a total count.
export function listMovements(
  variantId: string,
  params: { page?: number; limit?: number } = {}
): Promise<InventoryMovement[]> {
  return httpClient.get<InventoryMovement[]>(`/inventory/${variantId}/movements${toQueryString(params)}`)
}

export function restock(variantId: string, quantity: number, note?: string): Promise<InventoryRecord> {
  return httpClient.post<InventoryRecord>(`/inventory/${variantId}/restock`, { quantity, note })
}

export function adjust(variantId: string, delta: number, note?: string): Promise<InventoryRecord> {
  return httpClient.post<InventoryRecord>(`/inventory/${variantId}/adjust`, { delta, note })
}

export function setThreshold(variantId: string, threshold: number): Promise<void> {
  return httpClient.put<void>(`/inventory/${variantId}/threshold`, { threshold })
}
