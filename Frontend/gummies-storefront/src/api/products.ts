import { httpClient } from './httpClient'
import type { PaginatedResult } from '@/types/pagination'
import type { Product, ProductDetail } from '@/types/product'

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'best_selling'

export interface ListProductsParams {
  page?: number
  limit?: number
  categoryId?: string
  search?: string
  sort?: ProductSort
}

function toQueryString(params: object): string {
  const usp = new URLSearchParams()
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined && value !== '') usp.set(key, String(value))
  }
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}

export function list(params: ListProductsParams = {}): Promise<PaginatedResult<Product>> {
  return httpClient.getPaginated<Product>(`/products${toQueryString(params)}`)
}

export function getBySlug(slug: string): Promise<ProductDetail> {
  return httpClient.get<ProductDetail>(`/products/slug/${encodeURIComponent(slug)}`)
}
