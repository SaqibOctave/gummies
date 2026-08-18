import { httpClient } from './httpClient'
import type { PaginatedResult } from '@/types/pagination'
import type { Product, ProductAdminDetail, ProductImage, ProductInput, ProductVariant, VariantInput } from '@/types/product'

export interface ListProductsParams {
  page?: number
  limit?: number
  categoryId?: string
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

export function list(params: ListProductsParams = {}): Promise<PaginatedResult<Product>> {
  return httpClient.getPaginated<Product>(`/products${toQueryString(params)}`)
}

export function getById(id: string): Promise<ProductAdminDetail> {
  return httpClient.get<ProductAdminDetail>(`/products/${id}`)
}

export function create(input: ProductInput): Promise<Product> {
  return httpClient.post<Product>('/products', input)
}

export function update(id: string, input: Partial<ProductInput>): Promise<Product> {
  return httpClient.patch<Product>(`/products/${id}`, input)
}

export function remove(id: string): Promise<void> {
  return httpClient.delete<void>(`/products/${id}`)
}

export function addVariant(productId: string, input: VariantInput): Promise<ProductVariant> {
  return httpClient.post<ProductVariant>(`/products/${productId}/variants`, input)
}

export function updateVariant(
  productId: string,
  variantId: string,
  input: Partial<VariantInput>
): Promise<ProductVariant> {
  return httpClient.patch<ProductVariant>(`/products/${productId}/variants/${variantId}`, input)
}

export function removeVariant(productId: string, variantId: string): Promise<void> {
  return httpClient.delete<void>(`/products/${productId}/variants/${variantId}`)
}

export function attachImage(productId: string, mediaId: string, isPrimary?: boolean): Promise<ProductImage> {
  return httpClient.post<ProductImage>(`/products/${productId}/images`, { mediaId, isPrimary })
}

export function setPrimaryImage(productId: string, imageId: string): Promise<void> {
  return httpClient.put<void>(`/products/${productId}/images/${imageId}/primary`)
}

export function removeImage(productId: string, imageId: string): Promise<void> {
  return httpClient.delete<void>(`/products/${productId}/images/${imageId}`)
}
