import { formatMoney } from '@/lib/format'
import type { OrderItem } from '@/types/order'

export function OrderItemsTable({ items, currency }: { items: OrderItem[]; currency: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium tracking-wide text-slate-500 uppercase">
            <th className="px-4 py-2.5">Product</th>
            <th className="px-4 py-2.5">SKU</th>
            <th className="px-4 py-2.5">Unit price</th>
            <th className="px-4 py-2.5">Qty</th>
            <th className="px-4 py-2.5 text-right">Line total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-2.5">
                <div className="font-medium text-slate-900">{item.product_name}</div>
                <div className="text-xs text-slate-500">{item.variant_name}</div>
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{item.sku}</td>
              <td className="px-4 py-2.5 text-slate-500">{formatMoney(item.unit_price, currency)}</td>
              <td className="px-4 py-2.5 text-slate-500">{item.quantity}</td>
              <td className="px-4 py-2.5 text-right font-medium text-slate-900">
                {formatMoney(item.line_total, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
