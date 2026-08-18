import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ImageOff } from 'lucide-react'
import { useProductQuery } from '@/hooks/useProducts'
import { useCart } from '@/context/cart-context'
import { VariantPicker } from '@/components/products/VariantPicker'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { formatMoney } from '@/lib/format'
import type { ProductDetail as ProductDetailData } from '@/types/product'

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, isError } = useProductQuery(slug ?? '')

  if (isLoading) return <p className="py-16 text-center text-sm text-slate-500">Loading...</p>
  if (isError || !product) return <p className="py-16 text-center text-sm text-red-600">Product not found.</p>

  // Keyed by product id so quantity/selection state initializes fresh from
  // this product's own data on navigation between products, instead of an
  // effect syncing state after the fact.
  return <ProductDetailView key={product.id} product={product} />
}

function ProductDetailView({ product }: { product: ProductDetailData }) {
  const { addItem } = useCart()

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(() => {
    const firstAvailable = product.variants.find((v) => v.available_quantity > 0) ?? product.variants[0]
    return firstAvailable?.id ?? null
  })
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? null
  const activeImage = product.images[activeImageIndex]

  function handleAddToCart() {
    if (!selectedVariant) return
    addItem(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        variantName: selectedVariant.name,
        sku: selectedVariant.sku,
        price: selectedVariant.price,
        compareAtPrice: selectedVariant.compare_at_price,
        imageUrl: product.images[0]?.url ?? product.primary_image_url,
        availableQuantity: selectedVariant.available_quantity,
      },
      quantity
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
          {activeImage ? (
            <img src={activeImage.url} alt={activeImage.alt_text ?? product.name} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-slate-300">
              <ImageOff size={48} />
            </div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {product.images.map((image, i) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveImageIndex(i)}
                className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                  i === activeImageIndex ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                <img src={image.url} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{product.name}</h1>
        {product.short_description && <p className="mt-2 text-sm text-slate-600">{product.short_description}</p>}
        <p className="mt-4 text-2xl font-bold text-blue-800">
          {formatMoney(selectedVariant?.price ?? product.base_price)}
        </p>

        {product.variants.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-slate-700">Choose an option</p>
            <VariantPicker variants={product.variants} selectedId={selectedVariantId} onSelect={setSelectedVariantId} />
          </div>
        )}

        <div className="mt-6 flex items-center gap-4">
          <QuantityStepper value={quantity} max={selectedVariant?.available_quantity ?? 1} onChange={setQuantity} />
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.available_quantity <= 0}
            className="flex-1 rounded-md bg-blue-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {selectedVariant && selectedVariant.available_quantity <= 0 ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>

        {product.description && (
          <div className="mt-8 border-t border-slate-200 pt-6 text-sm whitespace-pre-line text-slate-600">
            {product.description}
          </div>
        )}
      </div>
    </div>
  )
}
