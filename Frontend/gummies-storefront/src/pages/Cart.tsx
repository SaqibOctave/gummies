import { Link, useNavigate } from 'react-router-dom'
import { ImageOff, X } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { usePublicSettingsQuery } from '@/hooks/useSettings'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { formatMoney } from '@/lib/format'

export function Cart() {
  const { lines, subtotal, updateQuantity, removeItem } = useCart()
  const settingsQuery = usePublicSettingsQuery()
  const navigate = useNavigate()

  const currency = settingsQuery.data?.store_currency ?? 'USD'
  const flatShippingRate = settingsQuery.data?.flat_shipping_rate ?? 0
  const freeShippingThreshold = settingsQuery.data?.free_shipping_threshold ?? 0
  const taxRatePercent = settingsQuery.data?.tax_rate_percent ?? 0

  const estimatedShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold ? 0 : flatShippingRate
  const estimatedTax = (subtotal * taxRatePercent) / 100
  const estimatedTotal = subtotal + estimatedShipping + estimatedTax

  if (lines.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-slate-500">Your cart is empty.</p>
        <Link
          to="/products"
          className="mt-4 inline-flex items-center rounded-md bg-blue-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-800"
        >
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Your cart</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {lines.map((line) => (
            <div key={line.variantId} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {line.imageUrl ? (
                  <img src={line.imageUrl} alt={line.productName} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-slate-300">
                    <ImageOff size={20} />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/products/${line.productSlug}`} className="text-sm font-medium text-slate-900 hover:underline">
                      {line.productName}
                    </Link>
                    <p className="text-xs text-slate-500">{line.variantName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(line.variantId)}
                    className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <QuantityStepper
                    value={line.quantity}
                    max={line.availableQuantity}
                    onChange={(q) => updateQuantity(line.variantId, q)}
                  />
                  <p className="text-sm font-semibold text-slate-900">
                    {formatMoney(Number(line.price) * line.quantity, currency)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Estimated shipping</span>
              <span>{formatMoney(estimatedShipping, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Estimated tax</span>
              <span>{formatMoney(estimatedTax, currency)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
              <span>Estimated total</span>
              <span>{formatMoney(estimatedTotal, currency)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="mt-5 w-full rounded-md bg-blue-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
