import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useOrderQuery } from '@/hooks/useOrders'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { UpdateStatusPanel } from '@/components/orders/UpdateStatusPanel'
import { AddressCard } from '@/components/orders/AddressCard'
import { OrderItemsTable } from '@/components/orders/OrderItemsTable'
import { formatDateTime, formatMoney } from '@/lib/format'
import { ORDER_STATUS_LABEL } from '@/types/order'

export function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: order, isLoading, isError } = useOrderQuery(id ?? '')

  if (isLoading) {
    return (
      <div className="px-6 py-6">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="px-6 py-6">
        <p className="text-sm text-red-600">Failed to load order.</p>
      </div>
    )
  }

  return (
    <div className="px-6 py-6">
      <button
        type="button"
        onClick={() => navigate('/orders')}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={14} />
        Back to orders
      </button>

      <div className="mt-2 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-xl font-semibold text-slate-900">{order.order_number}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">Placed {formatDateTime(order.placed_at)}</p>
        </div>
        <p className="text-2xl font-semibold text-slate-900">{formatMoney(order.grand_total, order.currency)}</p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Items</h2>
            <div className="mt-3">
              <OrderItemsTable items={order.items} currency={order.currency} />
            </div>

            <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal, order.currency)}</span>
              </div>
              {Number(order.discount_total) > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Discount</span>
                  <span>-{formatMoney(order.discount_total, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span>{formatMoney(order.shipping_total, order.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax</span>
                <span>{formatMoney(order.tax_total, order.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatMoney(order.grand_total, order.currency)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Update status</h2>
            <div className="mt-3">
              <UpdateStatusPanel orderId={order.id} status={order.status} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Status history</h2>
            <div className="mt-3 space-y-3">
              {order.statusHistory.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 text-sm">
                  <div className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-300" />
                  <div>
                    <p className="text-slate-900">
                      {entry.from_status ? (
                        <>
                          {ORDER_STATUS_LABEL[entry.from_status]} → {ORDER_STATUS_LABEL[entry.to_status]}
                        </>
                      ) : (
                        <>Order placed ({ORDER_STATUS_LABEL[entry.to_status]})</>
                      )}
                    </p>
                    {entry.note && <p className="text-slate-500">{entry.note}</p>}
                    <p className="text-xs text-slate-400">{formatDateTime(entry.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">Customer</h3>
            <div className="mt-2 text-sm text-slate-600">
              <p>{order.contact_name}</p>
              <p>{order.contact_email}</p>
              {order.contact_phone && <p>{order.contact_phone}</p>}
            </div>
          </section>

          <AddressCard title="Shipping address" address={order.shipping_address} />
          <AddressCard title="Billing address" address={order.billing_address} />

          {order.customer_notes && (
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">Customer notes</h3>
              <p className="mt-2 text-sm text-slate-600">{order.customer_notes}</p>
            </section>
          )}

          {order.internal_notes && (
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">Internal notes</h3>
              <p className="mt-2 text-sm text-slate-600">{order.internal_notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
