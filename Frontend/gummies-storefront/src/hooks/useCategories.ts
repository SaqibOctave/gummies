import { useQuery } from '@tanstack/react-query'
import * as categoriesApi from '@/api/categories'

export function useCategoriesQuery() {
  return useQuery({ queryKey: ['categories', 'list'], queryFn: categoriesApi.list })
}

export function useCategoryQuery(slug: string) {
  return useQuery({
    queryKey: ['categories', 'detail', slug],
    queryFn: () => categoriesApi.getBySlug(slug),
    enabled: Boolean(slug),
  })
}
