import { formatDateTime, formatMoney } from '@/lib/format'
import { ORDER_STATUS_BADGE_CLASS, ORDER_STATUS_LABEL } from '@/types/order'
import type { OrderWithItems } from '@/types/order'

export function OrderSummary({ order }: { order: OrderWithItems }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-semibold text-slate-900">{order.order_number}</p>
          <p className="mt-1 text-xs text-slate-500">Placed {formatDateTime(order.placed_at)}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_BADGE_CLASS[order.status]}`}
        >
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-medium tracking-wide text-slate-500 uppercase">
              <th className="pb-2">Item</th>
              <th className="pb-2 text-right">Qty</th>
              <th className="pb-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item, i) => (
              <tr key={i}>
                <td className="py-2.5">
                  <p className="font-medium text-slate-900">{item.product_name}</p>
                  <p className="text-xs text-slate-500">
                    {item.variant_name} &middot; {item.sku}
                  </p>
                </td>
                <td className="py-2.5 text-right text-slate-600 tabular-nums">{item.quantity}</td>
                <td className="py-2.5 text-right font-medium text-slate-900 tabular-nums">
                  {formatMoney(item.line_total, order.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-1 border-t border-slate-200 pt-4 text-sm">
        <div className="flex justify-between text-slate-500">
          <span>Subtotal</span>
          <span>{formatMoney(order.subtotal, order.currency)}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Shipping</span>
          <span>{formatMoney(order.shipping_total, order.currency)}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Tax</span>
          <span>{formatMoney(order.tax_total, order.currency)}</span>
        </div>
        <div className="flex justify-between pt-1 text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>{formatMoney(order.grand_total, order.currency)}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 border-t border-slate-200 pt-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Shipping address</p>
          <p className="mt-1 text-slate-700">
            {order.shipping_address.fullName}
            <br />
            {order.shipping_address.line1}
            {order.shipping_address.line2 && (
              <>
                <br />
                {order.shipping_address.line2}
              </>
            )}
            <br />
            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postalCode}
            <br />
            {order.shipping_address.country}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Contact</p>
          <p className="mt-1 text-slate-700">
            {order.contact_name}
            <br />
            {order.contact_email}
            {order.contact_phone && (
              <>
                <br />
                {order.contact_phone}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
