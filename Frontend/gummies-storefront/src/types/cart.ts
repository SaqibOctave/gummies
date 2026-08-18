export interface CartLine {
  variantId: string
  productId: string
  productSlug: string
  productName: string
  variantName: string
  sku: string
  price: string
  compareAtPrice: string | null
  imageUrl: string | null
  availableQuantity: number
  quantity: number
}
