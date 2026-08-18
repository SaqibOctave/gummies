import { Pencil, Trash2 } from 'lucide-react'
import type { ProductVariant } from '@/types/product'

interface VariantsTableProps {
  variants: ProductVariant[]
  onEdit: (variant: ProductVariant) => void
  onDelete: (variant: ProductVariant) => void
}

export function VariantsTable({ variants, onEdit, onDelete }: VariantsTableProps) {
  if (variants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center">
        <p className="text-sm text-slate-500">No variants yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium tracking-wide text-slate-500 uppercase">
            <th className="px-4 py-2.5">SKU</th>
            <th className="px-4 py-2.5">Name</th>
            <th className="px-4 py-2.5">Price</th>
            <th className="px-4 py-2.5">Compare-at</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {variants.map((variant) => (
            <tr key={variant.id} className="hover:bg-slate-50">
              <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{variant.sku}</td>
              <td className="px-4 py-2.5 font-medium text-slate-900">{variant.name}</td>
              <td className="px-4 py-2.5 text-slate-500">${Number(variant.price).toFixed(2)}</td>
              <td className="px-4 py-2.5 text-slate-500">
                {variant.compare_at_price ? `$${Number(variant.compare_at_price).toFixed(2)}` : '—'}
              </td>
              <td className="px-4 py-2.5">
                <span
                  className={[
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    variant.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500',
                  ].join(' ')}
                >
                  {variant.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-2.5">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(variant)}
                    title="Edit"
                    className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(variant)}
                    title="Delete"
                    className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
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
