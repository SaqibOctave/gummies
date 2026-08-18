import { ProductGrid } from '@/components/products/ProductGrid'
import type { Product } from '@/types/product'

interface FeaturedProductsProps {
  title: string | null
  products: Product[]
}

export function FeaturedProducts({ title, products }: FeaturedProductsProps) {
  if (products.length === 0) return null

  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-900">{title ?? 'Featured products'}</h2>
      <div className="mt-5">
        <ProductGrid products={products} />
      </div>
    </section>
  )
}
