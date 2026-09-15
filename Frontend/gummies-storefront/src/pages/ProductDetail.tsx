import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, ImageOff, Truck, Undo2 } from 'lucide-react'
import { useProductQuery } from '@/hooks/useProducts'
import { useCategoriesQuery } from '@/hooks/useCategories'
import { usePublicSettingsQuery } from '@/hooks/useSettings'
import { useCart } from '@/context/cart-context'
import { VariantPicker } from '@/components/products/VariantPicker'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { formatMoney } from '@/lib/format'
import type { ProductDetail as ProductDetailData } from '@/types/product'
import type { CartLine } from '@/types/cart'

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
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { data: categories = [] } = useCategoriesQuery()
  const { data: settings } = usePublicSettingsQuery()
  const category = categories.find((c) => c.id === product.category_id) ?? null

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(() => {
    const firstAvailable = product.variants.find((v) => v.available_quantity > 0) ?? product.variants[0]
    return firstAvailable?.id ?? null
  })
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? null
  const activeImage = product.images[activeImageIndex]
  const outOfStock = !selectedVariant || selectedVariant.available_quantity <= 0

  const price = Number(selectedVariant?.price ?? product.base_price)
  const compareAtPrice = selectedVariant?.compare_at_price ? Number(selectedVariant.compare_at_price) : null
  const discountPercent =
    compareAtPrice && compareAtPrice > price ? Math.round((1 - price / compareAtPrice) * 100) : null

  function buildCartLine(): Omit<CartLine, 'quantity'> | null {
    if (!selectedVariant) return null
    return {
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
    }
  }

  function handleAddToCart() {
    const line = buildCartLine()
    if (!line) return
    addItem(line, quantity)
  }

  function handleBuyNow() {
    const line = buildCartLine()
    if (!line) return
    addItem(line, quantity)
    navigate('/cart')
  }

  return (
    <div>
      <nav className="mb-5 flex flex-wrap items-center gap-1 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-700">
          Home
        </Link>
        {category && (
          <>
            <ChevronRight size={12} />
            <Link to={`/categories/${category.slug}`} className="hover:text-slate-700">
              {category.name}
            </Link>
          </>
        )}
        <ChevronRight size={12} />
        <span className="text-slate-700">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[22rem_1fr_19rem]">
        <div className="mx-auto w-full max-w-sm lg:mx-0">
          <div className="aspect-square overflow-hidden rounded-2xl bg-slate-100">
            {activeImage ? (
              <img
                src={activeImage.url}
                alt={activeImage.alt_text ?? product.name}
                className="size-full object-cover"
              />
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
                  className={`size-14 shrink-0 overflow-hidden rounded-lg border-2 ${
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

          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-3xl font-bold text-blue-800">{formatMoney(price)}</p>
            {compareAtPrice && (
              <>
                <p className="text-base text-slate-400 line-through">{formatMoney(compareAtPrice)}</p>
                {discountPercent !== null && (
                  <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs font-semibold text-orange-700">
                    -{discountPercent}%
                  </span>
                )}
              </>
            )}
          </div>

          {product.variants.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-slate-700">Choose an option</p>
              <VariantPicker variants={product.variants} selectedId={selectedVariantId} onSelect={setSelectedVariantId} />
            </div>
          )}

          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-slate-700">Quantity</p>
            <QuantityStepper value={quantity} max={selectedVariant?.available_quantity ?? 1} onChange={setQuantity} />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="flex-1 rounded-md border border-blue-700 px-6 py-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Buy now
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex-1 rounded-md bg-orange-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {outOfStock ? 'Out of stock' : 'Add to cart'}
            </button>
          </div>

          {product.description && (
            <div className="mt-8 border-t border-slate-200 pt-6 text-sm whitespace-pre-line text-slate-600">
              {product.description}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Delivery</p>
            <div className="mt-3 flex items-start gap-3">
              <Truck size={18} className="mt-0.5 shrink-0 text-slate-400" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-slate-900">Standard delivery</p>
                <p className="text-slate-500">3-5 business days</p>
              </div>
              <p className="text-sm font-medium text-slate-900">
                {settings?.flat_shipping_rate ? formatMoney(settings.flat_shipping_rate) : 'Free'}
              </p>
            </div>
            {settings?.free_shipping_threshold ? (
              <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-emerald-600">
                Free shipping on orders over {formatMoney(settings.free_shipping_threshold)}
              </p>
            ) : null}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <Undo2 size={18} className="mt-0.5 shrink-0 text-slate-400" />
              <div className="text-sm">
                <p className="font-medium text-slate-900">14-day easy returns</p>
                <p className="text-slate-500">Unopened packs only.</p>
              </div>
            </div>
          </div>

          {settings?.store_name && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Sold by</p>
              <p className="mt-1 font-medium text-slate-900">{settings.store_name}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
