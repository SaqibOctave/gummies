import { RefreshCw, TriangleAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import { useDashboardQuery } from '@/hooks/useReports'
import { useOrdersQuery } from '@/hooks/useOrders'
import { useInventoryQuery } from '@/hooks/useInventory'
import { StatTile } from '@/components/ui/StatTile'
import { HorizontalBarChart } from '@/components/reports/HorizontalBarChart'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { formatMoney, formatDateTime } from '@/lib/format'
import { ORDER_STATUS_HEX, ORDER_STATUS_LABEL, ORDER_STATUSES } from '@/types/order'

const TOP_PRODUCT_COLOR = '#2a78d6'

export function Dashboard() {
  const { admin } = useAuth()
  const navigate = useNavigate()

  const dashboardQuery = useDashboardQuery()
  const recentOrdersQuery = useOrdersQuery({ page: 1, limit: 5 })
  const lowStockQuery = useInventoryQuery({ page: 1, limit: 5, lowStockOnly: true })

  const dashboard = dashboardQuery.data

  const ordersByStatusData = ORDER_STATUSES.map((status) => ({
    label: ORDER_STATUS_LABEL[status],
    value: dashboard?.ordersByStatus[status] ?? 0,
    color: ORDER_STATUS_HEX[status],
  }))

  const topProductsData = (dashboard?.topProducts ?? []).map((p) => ({
    label: p.productName,
    value: p.totalQuantity,
    color: TOP_PRODUCT_COLOR,
  }))

  return (
    <div className="px-6 py-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Welcome, {admin?.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {admin?.email} &middot; {admin?.role}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            dashboardQuery.refetch()
            recentOrdersQuery.refetch()
            lowStockQuery.refetch()
          }}
          title="Refresh"
          className="flex size-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCw
            size={16}
            className={dashboardQuery.isFetching || recentOrdersQuery.isFetching || lowStockQuery.isFetching ? 'animate-spin' : ''}
          />
        </button>
      </div>

      {dashboardQuery.isLoading ? (
        <p className="mt-6 text-sm text-slate-500">Loading...</p>
      ) : dashboardQuery.isError ? (
        <p className="mt-6 text-sm text-red-600">Failed to load dashboard data.</p>
      ) : (
        dashboard && (
          <>
            <div className="mt-6 grid grid-cols-4 gap-4">
              <StatTile label="Total orders" value={String(dashboard.sales.orderCount)} />
              <StatTile label="Total revenue" value={formatMoney(dashboard.sales.totalRevenue)} />
              <StatTile label="Average order value" value={formatMoney(dashboard.sales.averageOrderValue)} />
              <StatTile label="Low stock variants" value={String(dashboard.counts.lowStockVariants)} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">Orders by status</h3>
                <div className="mt-3">
                  <HorizontalBarChart data={ordersByStatusData} />
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">Top products (all time)</h3>
                <div className="mt-3">
                  <HorizontalBarChart data={topProductsData} emptyLabel="No sales yet." />
                </div>
              </div>
            </div>
          </>
        )
      )}

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Recent orders</h3>
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="mt-3">
            {recentOrdersQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : recentOrdersQuery.isError ? (
              <p className="text-sm text-red-600">Failed to load recent orders.</p>
            ) : recentOrdersQuery.data && recentOrdersQuery.data.data.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentOrdersQuery.data.data.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="flex w-full items-center justify-between gap-3 py-2.5 text-left first:pt-0 last:pb-0 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{order.order_number}</p>
                      <p className="truncate text-xs text-slate-500">
                        {order.contact_name} &middot; {formatDateTime(order.placed_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-medium text-slate-900 tabular-nums">
                        {formatMoney(order.grand_total, order.currency)}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No orders yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Low stock alerts</h3>
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="mt-3">
            {lowStockQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : lowStockQuery.isError ? (
              <p className="text-sm text-red-600">Failed to load inventory.</p>
            ) : lowStockQuery.data && lowStockQuery.data.data.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {lowStockQuery.data.data.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(`/products/${item.product_id}`)}
                    className="flex w-full items-center justify-between gap-3 py-2.5 text-left first:pt-0 last:pb-0 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{item.product_name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {item.variant_name} &middot; {item.sku}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 text-amber-700">
                      <TriangleAlert size={14} />
                      <span className="text-sm font-medium tabular-nums">
                        {item.quantity_on_hand - item.quantity_reserved} / {item.low_stock_threshold}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Nothing low on stock.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
