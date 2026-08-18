export const HOMEPAGE_BLOCK_TYPES = [
  'hero_banner',
  'promo_banner',
  'featured_products',
  'category_grid',
  'rich_text',
] as const

export type HomepageBlockType = (typeof HOMEPAGE_BLOCK_TYPES)[number]

export const HOMEPAGE_BLOCK_TYPE_LABEL: Record<HomepageBlockType, string> = {
  hero_banner: 'Hero banner',
  promo_banner: 'Promo banner',
  featured_products: 'Featured products',
  category_grid: 'Category grid',
  rich_text: 'Rich text',
}

// The backend stores `config` as an untyped JSONB blob - these interfaces
// are a frontend-only convention for what each block type's config holds.
export interface HeroBannerConfig {
  headline?: string
  subheadline?: string
  imageId?: string
  imageUrl?: string
  ctaText?: string
  ctaUrl?: string
}

export interface PromoBannerConfig {
  text?: string
  ctaText?: string
  ctaUrl?: string
}

export interface FeaturedProductsConfig {
  productIds?: string[]
}

export interface CategoryGridConfig {
  categoryIds?: string[]
}

export interface RichTextConfig {
  content?: string
}

export interface HomepageBlock {
  id: string
  type: HomepageBlockType
  title: string | null
  config: Record<string, unknown>
  sort_order: number
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
}

export interface HomepageBlockInput {
  type?: HomepageBlockType // create-only - the backend doesn't allow changing type on update
  title?: string | null
  config?: Record<string, unknown>
  sortOrder?: number
  isActive?: boolean
  startsAt?: string | null
  endsAt?: string | null
}
