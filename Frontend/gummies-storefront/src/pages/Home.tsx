import { useHomepageBlocksQuery } from '@/hooks/useHomepage'
import { useProductsQuery } from '@/hooks/useProducts'
import { useCategoriesQuery } from '@/hooks/useCategories'
import { HeroBanner } from '@/components/homepage/HeroBanner'
import { PromoBanner } from '@/components/homepage/PromoBanner'
import { FeaturedProducts } from '@/components/homepage/FeaturedProducts'
import { CategoryGrid } from '@/components/homepage/CategoryGrid'
import { RichText } from '@/components/homepage/RichText'
import { FeatureStrip } from '@/components/homepage/FeatureStrip'
import type {
  CategoryGridConfig,
  FeaturedProductsConfig,
  HeroBannerConfig,
  PromoBannerConfig,
  RichTextConfig,
} from '@/types/homepage'

export function Home() {
  const blocksQuery = useHomepageBlocksQuery()
  // Fetched once, at a size that comfortably covers a curated homepage
  // selection, and used to resolve featured_products/category_grid blocks'
  // productIds/categoryIds without an N+1 request per block.
  const productsQuery = useProductsQuery({ page: 1, limit: 100 })
  const categoriesQuery = useCategoriesQuery()

  if (blocksQuery.isLoading) {
    return <p className="py-16 text-center text-sm text-slate-500">Loading...</p>
  }

  if (blocksQuery.isError) {
    return <p className="py-16 text-center text-sm text-red-600">Failed to load the homepage.</p>
  }

  const productsById = new Map((productsQuery.data?.data ?? []).map((p) => [p.id, p]))
  const categoriesById = new Map((categoriesQuery.data ?? []).map((c) => [c.id, c]))
  const blocks = blocksQuery.data ?? []
  const heroBlocks = blocks.filter((b) => b.type === 'hero_banner')
  const restBlocks = blocks.filter((b) => b.type !== 'hero_banner')

  return (
    <div className="space-y-14">
      {heroBlocks.map((block) => (
        <HeroBanner key={block.id} config={block.config as HeroBannerConfig} />
      ))}

      <FeatureStrip />

      {restBlocks.map((block) => {
        switch (block.type) {
          case 'promo_banner':
            return <PromoBanner key={block.id} config={block.config as PromoBannerConfig} />
          case 'featured_products': {
            const config = block.config as FeaturedProductsConfig
            const products = (config.productIds ?? [])
              .map((id) => productsById.get(id))
              .filter((p) => p !== undefined)
            return <FeaturedProducts key={block.id} title={block.title} products={products} />
          }
          case 'category_grid': {
            const config = block.config as CategoryGridConfig
            const categories = (config.categoryIds ?? [])
              .map((id) => categoriesById.get(id))
              .filter((c) => c !== undefined)
            return <CategoryGrid key={block.id} title={block.title} categories={categories} />
          }
          case 'rich_text':
            return <RichText key={block.id} title={block.title} config={block.config as RichTextConfig} />
          default:
            return null
        }
      })}
    </div>
  )
}
