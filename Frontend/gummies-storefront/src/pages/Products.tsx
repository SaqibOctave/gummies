import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useProductsQuery } from '@/hooks/useProducts'
import { useCategoriesQuery } from '@/hooks/useCategories'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Pagination } from '@/components/ui/Pagination'

const PAGE_SIZE = 12

export function Products() {
  const [urlParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(() => urlParams.get('search') ?? '')
  const [search, setSearch] = useState(() => urlParams.get('search') ?? '')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const categoriesQuery = useCategoriesQuery()
  const productsQuery = useProductsQuery({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    categoryId: categoryId || undefined,
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Shop all gummies</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="w-64 rounded-md border border-slate-300 py-2 pr-4 pl-9 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value)
            setPage(1)
          }}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All categories</option>
          {(categoriesQuery.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        {productsQuery.isLoading ? (
          <p className="py-16 text-center text-sm text-slate-500">Loading...</p>
        ) : productsQuery.isError ? (
          <p className="py-16 text-center text-sm text-red-600">Failed to load products.</p>
        ) : (
          <>
            <ProductGrid products={productsQuery.data?.data ?? []} />
            {productsQuery.data && (
              <Pagination
                page={productsQuery.data.meta.page}
                totalPages={productsQuery.data.meta.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
