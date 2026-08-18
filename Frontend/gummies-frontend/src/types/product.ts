export interface Product {
  id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  short_description: string | null
  base_price: string
  meta_title: string | null
  meta_description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  media_id: string
  sort_order: number
  is_primary: boolean
  created_at: string
  url?: string
  alt_text?: string | null
}

export interface ProductAdminDetail extends Product {
  variants: ProductVariant[]
  images: ProductImage[]
}

export interface ProductInput {
  categoryId?: string | null
  name: string
  slug?: string
  description?: string | null
  shortDescription?: string | null
  basePrice: number
  metaTitle?: string | null
  metaDescription?: string | null
  isActive?: boolean
}

export interface VariantInput {
  sku: string
  name: string
  price: number
  compareAtPrice?: number | null
  attributes?: Record<string, string>
  sortOrder?: number
  isActive?: boolean
  initialQuantity?: number
  lowStockThreshold?: number
}
