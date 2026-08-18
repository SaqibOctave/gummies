import { httpClient } from './httpClient'
import type { DashboardSummary, RevenuePoint, SalesSummary, TopProduct } from '@/types/reports'

function toQueryString(params: object): string {
  const usp = new URLSearchParams()
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined && value !== '') usp.set(key, String(value))
  }
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}

export function getDashboard(): Promise<DashboardSummary> {
  return httpClient.get<DashboardSummary>('/reports/dashboard')
}

export function getSales(dateFrom?: string, dateTo?: string): Promise<SalesSummary> {
  return httpClient.get<SalesSummary>(`/reports/sales${toQueryString({ dateFrom, dateTo })}`)
}

export function getRevenueOverTime(dateFrom: string, dateTo: string): Promise<RevenuePoint[]> {
  return httpClient.get<RevenuePoint[]>(`/reports/revenue-over-time${toQueryString({ dateFrom, dateTo })}`)
}

export function getTopProducts(dateFrom?: string, dateTo?: string, limit = 5): Promise<TopProduct[]> {
  return httpClient.get<TopProduct[]>(`/reports/top-products${toQueryString({ dateFrom, dateTo, limit })}`)
}
