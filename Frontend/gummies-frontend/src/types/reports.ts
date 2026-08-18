import type { OrderStatus } from './order'

export interface SalesSummary {
  orderCount: number
  totalRevenue: number
  averageOrderValue: number
}

export interface DashboardCounts {
  totalProducts: number
  totalCategories: number
  totalCustomers: number
  lowStockVariants: number
}

export interface TopProduct {
  productId: string
  productName: string
  totalQuantity: number
  totalRevenue: number
}

export interface DashboardSummary {
  sales: SalesSummary
  ordersByStatus: Partial<Record<OrderStatus, number>>
  counts: DashboardCounts
  topProducts: TopProduct[]
}

export interface RevenuePoint {
  day: string
  revenue: number
  orderCount: number
}
