export type HomepageBlockType = 'hero_banner' | 'promo_banner' | 'featured_products' | 'category_grid' | 'rich_text'

// The backend stores `config` as an untyped JSONB blob - these interfaces
// are a frontend-only convention for what each block type's config holds
// (mirrors Frontend/gummies-frontend/src/types/homepage.ts, which is what
// actually writes these blocks from the admin panel).
export interface HeroBannerConfig {
  headline?: string
  subheadline?: string
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
}
