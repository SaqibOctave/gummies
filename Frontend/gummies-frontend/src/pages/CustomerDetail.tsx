import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCustomerOrderHistoryQuery, useCustomerQuery } from '@/hooks/useCustomers'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { formatDate, formatDateTime, formatMoney } from '@/lib/format'

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: customer, isLoading, isError } = useCustomerQuery(id ?? '')
  const { data: orders = [], isLoading: ordersLoading } = useCustomerOrderHistoryQuery(id ?? '')

  if (isLoading) {
    return (
      <div className="px-6 py-6">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    )
  }

  if (isError || !customer) {
    return (
      <div className="px-6 py-6">
        <p className="text-sm text-red-600">Failed to load customer.</p>
      </div>
    )
  }

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.grand_total), 0)

  return (
    <div className="px-6 py-6">
      <button
        type="button"
        onClick={() => navigate('/customers')}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={14} />
        Back to customers
      </button>

      <div className="mt-2">
        <h1 className="text-xl font-semibold text-slate-900">{customer.name}</h1>
        <p className="mt-1 text-sm text-slate-500">Customer since {formatDate(customer.created_at)}</p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Order history</h2>
            <div className="mt-3">
              {ordersLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : orders.length === 0 ? (
                <p className="text-sm text-slate-500">No orders yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium tracking-wide text-slate-500 uppercase">
                        <th className="px-4 py-2.5">Order</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5">Placed</th>
                        <th className="px-4 py-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5">
                            <button
                              type="button"
                              onClick={() => navigate(`/orders/${order.id}`)}
                              className="font-mono text-xs font-medium text-slate-900 hover:underline"
                            >
                              {order.order_number}
                            </button>
                          </td>
                          <td className="px-4 py-2.5">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="px-4 py-2.5 text-slate-500">{formatDateTime(order.placed_at)}</td>
                          <td className="px-4 py-2.5 text-right font-medium text-slate-900">
                            {formatMoney(order.grand_total, order.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
            <div className="mt-2 text-sm text-slate-600">
              <p>{customer.email}</p>
              {customer.phone && <p>{customer.phone}</p>}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Lifetime value</h3>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Orders</span>
                <span className="font-medium text-slate-900">{orders.length}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total spent</span>
                <span className="font-medium text-slate-900">{formatMoney(totalSpent, orders[0]?.currency)}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
