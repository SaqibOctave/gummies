import { formatMoney } from '@/lib/format'
import type { ProductVariant } from '@/types/product'

interface VariantPickerProps {
  variants: ProductVariant[]
  selectedId: string | null
  onSelect: (variantId: string) => void
}

export function VariantPicker({ variants, selectedId, onSelect }: VariantPickerProps) {
  return (
    <div className="space-y-2">
      {variants.map((variant) => {
        const outOfStock = variant.available_quantity <= 0
        const selected = variant.id === selectedId
        return (
          <button
            key={variant.id}
            type="button"
            disabled={outOfStock}
            onClick={() => onSelect(variant.id)}
            className={[
              'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition',
              selected ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200 hover:border-slate-300',
              outOfStock ? 'cursor-not-allowed opacity-50' : '',
            ].join(' ')}
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{variant.name}</p>
              <p className="text-xs text-slate-500">
                {outOfStock ? 'Out of stock' : `${variant.available_quantity} available`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{formatMoney(variant.price)}</p>
              {variant.compare_at_price && (
                <p className="text-xs text-slate-400 line-through">{formatMoney(variant.compare_at_price)}</p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
