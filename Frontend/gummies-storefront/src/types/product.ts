export interface Product {
  id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  short_description: string | null
  base_price: string
  is_active: boolean
  created_at: string
  updated_at: string
  primary_image_url: string | null
  primary_image_alt: string | null
}

export interface ProductVariant {
  id: string
  product_id: string
  sku: string
  name: string
  price: string
  compare_at_price: string | null
  attributes: Record<string, unknown>
  is_active: boolean
  sort_order: number
  quantity_on_hand: number
  quantity_reserved: number
  available_quantity: number
}

export interface ProductImage {
  id: string
  product_id: string
  media_id: string
  sort_order: number
  is_primary: boolean
  url: string
  alt_text: string | null
}

export interface ProductDetail extends Product {
  variants: ProductVariant[]
  images: ProductImage[]
}
