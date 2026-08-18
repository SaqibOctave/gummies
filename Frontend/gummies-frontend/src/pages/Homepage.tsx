import { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useDeleteHomepageBlockMutation, useHomepageBlocksQuery } from '@/hooks/useHomepage'
import { HomepageBlocksTable } from '@/components/homepage/HomepageBlocksTable'
import { HomepageBlockFormDialog } from '@/components/homepage/HomepageBlockFormDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ApiError } from '@/api/httpClient'
import type { HomepageBlock } from '@/types/homepage'

export function Homepage() {
  const { data: blocks = [], isLoading, isError, isFetching, refetch } = useHomepageBlocksQuery()
  const deleteMutation = useDeleteHomepageBlockMutation()

  const [formState, setFormState] = useState<{ open: boolean; block?: HomepageBlock }>({ open: false })
  const [deleteTarget, setDeleteTarget] = useState<HomepageBlock | null>(null)

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast.success('Block deleted')
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete block')
    }
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Homepage CMS</h1>
          <p className="mt-1 text-sm text-slate-500">Manage the content blocks shown on the storefront homepage.</p>
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
            Add block
          </button>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Failed to load homepage blocks.</p>
        ) : (
          <HomepageBlocksTable
            blocks={blocks}
            onEdit={(block) => setFormState({ open: true, block })}
            onDelete={(block) => setDeleteTarget(block)}
          />
        )}
      </div>

      <HomepageBlockFormDialog
        key={formState.block?.id ?? 'create'}
        open={formState.open}
        onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
        block={formState.block}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete block"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title || 'this block'}"? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
