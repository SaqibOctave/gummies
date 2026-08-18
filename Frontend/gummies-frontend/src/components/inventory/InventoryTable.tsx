import { Settings2 } from 'lucide-react'
import type { InventoryWithProductInfo } from '@/types/inventory'

interface InventoryTableProps {
  items: InventoryWithProductInfo[]
  onManage: (item: InventoryWithProductInfo) => void
}

function StockStatusBadge({ available, threshold }: { available: number; threshold: number }) {
  if (available <= 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        Out of stock
      </span>
    )
  }
  if (available <= threshold) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
        Low stock
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
      In stock
    </span>
  )
}

export function InventoryTable({ items, onManage }: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center">
        <p className="text-sm text-slate-500">No inventory records found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium tracking-wide text-slate-500 uppercase">
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Variant</th>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3">On hand</th>
            <th className="px-4 py-3">Reserved</th>
            <th className="px-4 py-3">Available</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => {
            const available = item.quantity_on_hand - item.quantity_reserved
            return (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{item.product_name}</td>
                <td className="px-4 py-3 text-slate-500">{item.variant_name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.sku}</td>
                <td className="px-4 py-3 text-slate-500">{item.quantity_on_hand}</td>
                <td className="px-4 py-3 text-slate-500">{item.quantity_reserved}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{available}</td>
                <td className="px-4 py-3">
                  <StockStatusBadge available={available} threshold={item.low_stock_threshold} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onManage(item)}
                      className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <Settings2 size={13} />
                      Manage
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
