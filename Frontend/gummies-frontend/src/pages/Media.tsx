import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { RefreshCw, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useDeleteMediaMutation, useMediaQuery, useUploadMediaMutation } from '@/hooks/useMedia'
import { MediaGrid } from '@/components/media/MediaGrid'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Pagination } from '@/components/ui/Pagination'
import { ApiError } from '@/api/httpClient'
import type { Media } from '@/types/media'

const PAGE_SIZE = 24

export function MediaLibrary() {
  const [page, setPage] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null)

  const { data, isLoading, isError, isFetching, refetch } = useMediaQuery({ page, limit: PAGE_SIZE })
  const uploadMutation = useUploadMediaMutation()
  const deleteMutation = useDeleteMediaMutation()

  async function handleFilesSelected(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setIsUploading(true)
    try {
      for (const file of files) {
        await uploadMutation.mutateAsync({ file })
      }
      toast.success(files.length > 1 ? 'Files uploaded' : 'File uploaded')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to upload file')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      toast.success('Media deleted')
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete media')
    }
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Media</h1>
          <p className="mt-1 text-sm text-slate-500">Images used across products, categories, and the homepage.</p>
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
          <label className="flex cursor-pointer items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
            <Upload size={16} />
            {isUploading ? 'Uploading...' : 'Upload'}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Failed to load media.</p>
        ) : (
          <>
            <MediaGrid items={data?.data ?? []} onDelete={(media) => setDeleteTarget(media)} />
            {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete media"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.original_name}"? If it's still in use, it will be removed from any product gallery or category it's attached to. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
