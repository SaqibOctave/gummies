import { useQuery } from '@tanstack/react-query'
import * as productsApi from '@/api/products'
import type { ListProductsParams } from '@/api/products'

export function useProductsQuery(params: ListProductsParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['products', 'list', params],
    queryFn: () => productsApi.list(params),
    placeholderData: (prev) => prev,
    enabled: options.enabled,
  })
}

export function useProductQuery(slug: string) {
  return useQuery({
    queryKey: ['products', 'detail', slug],
    queryFn: () => productsApi.getBySlug(slug),
    enabled: Boolean(slug),
  })
}
