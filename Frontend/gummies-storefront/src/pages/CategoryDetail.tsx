import { useParams } from 'react-router-dom'
import { useCategoryQuery } from '@/hooks/useCategories'
import { useProductsQuery } from '@/hooks/useProducts'
import { ProductGrid } from '@/components/products/ProductGrid'

export function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>()
  const categoryQuery = useCategoryQuery(slug ?? '')
  const productsQuery = useProductsQuery(
    { page: 1, limit: 48, categoryId: categoryQuery.data?.id },
    { enabled: Boolean(categoryQuery.data?.id) }
  )

  if (categoryQuery.isLoading) return <p className="py-16 text-center text-sm text-slate-500">Loading...</p>
  if (categoryQuery.isError || !categoryQuery.data) {
    return <p className="py-16 text-center text-sm text-red-600">Category not found.</p>
  }

  const category = categoryQuery.data

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">{category.name}</h1>
      {category.description && <p className="mt-2 max-w-2xl text-sm text-slate-600">{category.description}</p>}

      <div className="mt-8">
        {productsQuery.isLoading ? (
          <p className="py-16 text-center text-sm text-slate-500">Loading...</p>
        ) : (
          <ProductGrid products={productsQuery.data?.data ?? []} emptyLabel="No products in this category yet." />
        )}
      </div>
    </div>
  )
}
