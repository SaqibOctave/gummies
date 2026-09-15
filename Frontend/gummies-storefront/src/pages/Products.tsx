import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useProductsQuery } from '@/hooks/useProducts'
import { useCategoriesQuery } from '@/hooks/useCategories'
import { ProductGrid } from '@/components/products/ProductGrid'
import { Pagination } from '@/components/ui/Pagination'
import type { ProductSort } from '@/api/products'

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'best_selling', label: 'Best selling' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A-Z' },
]

const PAGE_SIZE_OPTIONS = [12, 24, 48]

export function Products() {
  const [urlParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(() => urlParams.get('search') ?? '')
  const [search, setSearch] = useState(() => urlParams.get('search') ?? '')
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState<ProductSort>('best_selling')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
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
    limit: pageSize,
    search: search || undefined,
    categoryId: categoryId || undefined,
    sort,
  })

  const categories = categoriesQuery.data ?? []
  const activeCategoryName = categories.find((c) => c.id === categoryId)?.name

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        {activeCategoryName ?? 'Shop all gummies'}
      </h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[16rem_1fr]">
        <aside>
          <div className="relative mb-5">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-md border border-slate-300 py-2 pr-4 pl-9 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <p className="border-b border-slate-200 pb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Categories
          </p>
          <ul className="mt-2 space-y-0.5">
            <li>
              <button
                type="button"
                onClick={() => {
                  setCategoryId('')
                  setPage(1)
                }}
                className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                  categoryId === '' ? 'bg-blue-50 font-medium text-blue-800' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All products
              </button>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryId(c.id)
                    setPage(1)
                  }}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    categoryId === c.id ? 'bg-blue-50 font-medium text-blue-800' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <p className="text-sm text-slate-500">
              {productsQuery.data ? `${productsQuery.data.meta.total} products` : ' '}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                Items per page
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPage(1)
                  }}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-normal text-slate-700 normal-case outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium tracking-wide text-slate-500 uppercase">
                Sort by
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as ProductSort)
                    setPage(1)
                  }}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-normal text-slate-700 normal-case outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-6">
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
      </div>
    </div>
  )
}
