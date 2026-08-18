import { ProductCard } from './ProductCard'
import type { Product } from '@/types/product'

interface ProductGridProps {
  products: Product[]
  emptyLabel?: string
}

export function ProductGrid({ products, emptyLabel = 'No products found.' }: ProductGridProps) {
  if (products.length === 0) {
    return <p className="py-16 text-center text-sm text-slate-500">{emptyLabel}</p>
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
