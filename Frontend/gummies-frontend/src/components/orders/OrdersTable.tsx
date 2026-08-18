import { Eye } from 'lucide-react'
import { formatDateTime, formatMoney } from '@/lib/format'
import { OrderStatusBadge } from './OrderStatusBadge'
import type { Order } from '@/types/order'

interface OrdersTableProps {
  orders: Order[]
  onView: (order: Order) => void
}

export function OrdersTable({ orders, onView }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center">
        <p className="text-sm text-slate-500">No orders found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium tracking-wide text-slate-500 uppercase">
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Placed</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onView(order)}
                  className="font-mono text-xs font-medium text-slate-900 hover:underline"
                >
                  {order.order_number}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="text-slate-900">{order.contact_name}</div>
                <div className="text-xs text-slate-500">{order.contact_email}</div>
              </td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 font-medium text-slate-900">
                {formatMoney(order.grand_total, order.currency)}
              </td>
              <td className="px-4 py-3 text-slate-500">{formatDateTime(order.placed_at)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onView(order)}
                    title="View"
                    className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
