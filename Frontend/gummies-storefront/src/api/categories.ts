import { httpClient } from './httpClient'
import type { Category } from '@/types/category'

export function list(): Promise<Category[]> {
  return httpClient.get<Category[]>('/categories')
}

export function getBySlug(slug: string): Promise<Category> {
  return httpClient.get<Category>(`/categories/slug/${encodeURIComponent(slug)}`)
}
