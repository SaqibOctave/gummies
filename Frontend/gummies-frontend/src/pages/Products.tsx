import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useProductsQuery, useDeleteProductMutation } from '@/hooks/useProducts'
import { useCategoriesQuery } from '@/hooks/useCategories'
import { ProductsTable } from '@/components/products/ProductsTable'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Pagination } from '@/components/ui/Pagination'
import { ApiError } from '@/api/httpClient'
import type { Product } from '@/types/product'

const PAGE_SIZE = 20

export function Products() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const { data: categories = [] } = useCategoriesQuery()
  const categoryNameById = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories])

  const { data, isLoading, isError, isFetching, refetch } = useProductsQuery({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    categoryId: categoryId || undefined,
  })
  const deleteMutation = useDeleteProductMutation()

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast.success('Product deleted')
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete product')
    }
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your product catalog.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh"
            className="flex size-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => navigate('/products/new')}
            className="flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus size={16} />
            Add product
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-md border border-slate-300 py-2 pr-3 pl-9 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value)
            setPage(1)
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Failed to load products.</p>
        ) : (
          <>
            <ProductsTable
              products={data?.data ?? []}
              categoryNameById={categoryNameById}
              onEdit={(product) => navigate(`/products/${product.id}`)}
              onDelete={(product) => setDeleteTarget(product)}
            />
            {data && (
              <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete product"
        description={
          deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.` : undefined
        }
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
