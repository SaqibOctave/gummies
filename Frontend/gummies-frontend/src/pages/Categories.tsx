import { useMemo, useState } from 'react'
import { Plus, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useCategoriesQuery, useDeleteCategoryMutation } from '@/hooks/useCategories'
import { CategoriesTable } from '@/components/categories/CategoriesTable'
import { CategoryFormDialog } from '@/components/categories/CategoryFormDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ApiError } from '@/api/httpClient'
import type { Category } from '@/types/category'

export function Categories() {
  const { data: categories = [], isLoading, isError, refetch, isFetching } = useCategoriesQuery()
  const deleteMutation = useDeleteCategoryMutation()

  const [search, setSearch] = useState('')
  const [formState, setFormState] = useState<{ open: boolean; category?: Category }>({ open: false })
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
  }, [categories, search])

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast.success('Category deleted')
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete category')
    }
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Organize your products into categories.</p>
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
            onClick={() => setFormState({ open: true })}
            className="flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus size={16} />
            Add category
          </button>
        </div>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full rounded-md border border-slate-300 py-2 pr-3 pl-9 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Failed to load categories.</p>
        ) : (
          <CategoriesTable
            categories={filtered}
            onEdit={(category) => setFormState({ open: true, category })}
            onDelete={(category) => setDeleteTarget(category)}
          />
        )}
      </div>

      <CategoryFormDialog
        key={formState.category?.id ?? 'create'}
        open={formState.open}
        onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
        category={formState.category}
        categories={categories}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete category"
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
