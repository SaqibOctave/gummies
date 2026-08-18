import { useQuery } from '@tanstack/react-query'
import * as reportsApi from '@/api/reports'

export function useDashboardQuery() {
  return useQuery({ queryKey: ['reports', 'dashboard'], queryFn: reportsApi.getDashboard })
}

export function useSalesQuery(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ['reports', 'sales', dateFrom, dateTo],
    queryFn: () => reportsApi.getSales(dateFrom, dateTo),
  })
}

export function useRevenueOverTimeQuery(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ['reports', 'revenue-over-time', dateFrom, dateTo],
    queryFn: () => reportsApi.getRevenueOverTime(dateFrom, dateTo),
    enabled: Boolean(dateFrom && dateTo),
    placeholderData: (prev) => prev,
  })
}

export function useTopProductsQuery(dateFrom: string, dateTo: string, limit = 5) {
  return useQuery({
    queryKey: ['reports', 'top-products', dateFrom, dateTo, limit],
    queryFn: () => reportsApi.getTopProducts(dateFrom, dateTo, limit),
    placeholderData: (prev) => prev,
  })
}
