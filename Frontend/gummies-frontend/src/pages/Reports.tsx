import { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useDashboardQuery, useRevenueOverTimeQuery, useSalesQuery, useTopProductsQuery } from '@/hooks/useReports'
import { StatTile } from '@/components/ui/StatTile'
import { HorizontalBarChart } from '@/components/reports/HorizontalBarChart'
import { RevenueChart } from '@/components/reports/RevenueChart'
import { DateRangeFilter } from '@/components/reports/DateRangeFilter'
import { formatMoney } from '@/lib/format'
import { ORDER_STATUS_HEX, ORDER_STATUS_LABEL, ORDER_STATUSES } from '@/types/order'
import type { RevenuePoint } from '@/types/reports'

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// The backend only returns rows for days that actually had orders (a GROUP
// BY, not a calendar fill) - zero-fill the gaps so the chart plots a real
// timeline (flat $0 baseline, spikes where sales happened) instead of a
// handful of disconnected points floating at the left edge.
function fillDateRange(points: RevenuePoint[], dateFrom: string, dateTo: string): RevenuePoint[] {
  const byDay = new Map(points.map((p) => [p.day, p]))
  const result: RevenuePoint[] = []
  const cursor = new Date(`${dateFrom}T00:00:00Z`)
  const end = new Date(`${dateTo}T00:00:00Z`)
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10)
    result.push(byDay.get(key) ?? { day: key, revenue: 0, orderCount: 0 })
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return result
}

export function Reports() {
  const [rangeDays, setRangeDays] = useState(30)

  const { dateFrom, dateTo } = useMemo(() => {
    const to = new Date()
    const from = new Date(to)
    from.setDate(from.getDate() - (rangeDays - 1))
    return { dateFrom: toDateOnly(from), dateTo: toDateOnly(to) }
  }, [rangeDays])

  const dashboardQuery = useDashboardQuery()
  const salesQuery = useSalesQuery(dateFrom, dateTo)
  const revenueQuery = useRevenueOverTimeQuery(dateFrom, dateTo)
  const topProductsQuery = useTopProductsQuery(dateFrom, dateTo, 5)

  const dashboard = dashboardQuery.data
  const ordersByStatusData = ORDER_STATUSES.map((status) => ({
    label: ORDER_STATUS_LABEL[status],
    value: dashboard?.ordersByStatus[status] ?? 0,
    color: ORDER_STATUS_HEX[status],
  }))

  const topProductsData = (topProductsQuery.data ?? []).map((p) => ({
    label: p.productName,
    value: p.totalQuantity,
    color: '#2a78d6',
  }))

  return (
    <div className="px-6 py-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Sales performance and catalog health at a glance.</p>
        </div>
        <button
          type="button"
          onClick={() => dashboardQuery.refetch()}
          title="Refresh"
          className="flex size-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCw size={16} className={dashboardQuery.isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {dashboardQuery.isLoading ? (
        <p className="mt-6 text-sm text-slate-500">Loading...</p>
      ) : dashboardQuery.isError ? (
        <p className="mt-6 text-sm text-red-600">Failed to load dashboard data.</p>
      ) : (
        dashboard && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-slate-900">Overview (all time)</h2>
            <div className="mt-3 grid grid-cols-4 gap-4">
              <StatTile label="Total orders" value={String(dashboard.sales.orderCount)} />
              <StatTile label="Total revenue" value={formatMoney(dashboard.sales.totalRevenue)} />
              <StatTile label="Average order value" value={formatMoney(dashboard.sales.averageOrderValue)} />
              <StatTile label="Low stock variants" value={String(dashboard.counts.lowStockVariants)} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="col-span-2 rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">Orders by status</h3>
                <div className="mt-3">
                  <HorizontalBarChart data={ordersByStatusData} />
                </div>
              </div>
              <div className="space-y-4">
                <StatTile label="Products" value={String(dashboard.counts.totalProducts)} />
                <StatTile label="Categories" value={String(dashboard.counts.totalCategories)} />
                <StatTile label="Customers" value={String(dashboard.counts.totalCustomers)} />
              </div>
            </div>
          </section>
        )
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Sales trends</h2>
          <DateRangeFilter days={rangeDays} onChange={setRangeDays} />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-4">
          <StatTile label="Orders" value={salesQuery.data ? String(salesQuery.data.orderCount) : '—'} />
          <StatTile label="Revenue" value={salesQuery.data ? formatMoney(salesQuery.data.totalRevenue) : '—'} />
          <StatTile
            label="Average order value"
            value={salesQuery.data ? formatMoney(salesQuery.data.averageOrderValue) : '—'}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className={`col-span-2 rounded-lg border border-slate-200 bg-white p-4 transition-opacity ${revenueQuery.isFetching ? 'opacity-60' : ''}`}>
            <h3 className="text-sm font-semibold text-slate-900">Revenue over time</h3>
            <div className="mt-3">
              {revenueQuery.isLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : (
                <RevenueChart data={fillDateRange(revenueQuery.data ?? [], dateFrom, dateTo)} />
              )}
            </div>
          </div>
          <div
            className={`rounded-lg border border-slate-200 bg-white p-4 transition-opacity ${topProductsQuery.isFetching ? 'opacity-60' : ''}`}
          >
            <h3 className="text-sm font-semibold text-slate-900">Top products</h3>
            <div className="mt-3">
              <HorizontalBarChart data={topProductsData} emptyLabel="No sales in this range." />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
