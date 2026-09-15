import { Link } from 'react-router-dom'
import { ImageOff } from 'lucide-react'
import { formatMoney } from '@/lib/format'
import type { Product } from '@/types/product'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-300 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {!product.in_stock && (
          <span className="absolute top-2 left-2 z-10 rounded bg-slate-700/90 px-2 py-1 text-[11px] font-semibold tracking-wide text-white uppercase">
            Sold out
          </span>
        )}
        {product.primary_image_url ? (
          <img
            src={product.primary_image_url}
            alt={product.primary_image_alt ?? product.name}
            className={`size-full object-cover transition duration-300 group-hover:scale-105 ${
              product.in_stock ? '' : 'opacity-60'
            }`}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-slate-300">
            <ImageOff size={32} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="truncate text-sm font-medium text-slate-900">{product.name}</h3>
        {product.short_description && (
          <p className="mt-1 truncate text-xs text-slate-500">{product.short_description}</p>
        )}
        <div className="mt-2.5 flex items-center justify-between">
          <p className="text-base font-bold text-blue-800">{formatMoney(product.base_price)}</p>
          {product.in_stock ? (
            <span className="rounded-md bg-blue-800 px-3 py-1.5 text-xs font-semibold text-white transition group-hover:bg-orange-500">
              Shop now
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-400">Unavailable</span>
          )}
        </div>
      </div>
    </Link>
  )
}
