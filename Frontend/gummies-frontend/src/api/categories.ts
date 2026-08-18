import { httpClient } from './httpClient'
import type { Category, CategoryInput } from '@/types/category'

export function list(): Promise<Category[]> {
  return httpClient.get<Category[]>('/categories')
}

export function getById(id: string): Promise<Category> {
  return httpClient.get<Category>(`/categories/${id}`)
}

export function create(input: CategoryInput): Promise<Category> {
  return httpClient.post<Category>('/categories', input)
}

export function update(id: string, input: Partial<CategoryInput>): Promise<Category> {
  return httpClient.patch<Category>(`/categories/${id}`, input)
}

export function remove(id: string): Promise<void> {
  return httpClient.delete<void>(`/categories/${id}`)
}
