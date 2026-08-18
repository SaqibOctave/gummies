import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Star, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import * as mediaApi from '@/api/media'
import { useAttachImageMutation, useRemoveImageMutation, useSetPrimaryImageMutation } from '@/hooks/useProducts'
import { ApiError } from '@/api/httpClient'
import type { ProductImage } from '@/types/product'

interface ImagesPanelProps {
  productId: string
  images: ProductImage[]
}

export function ImagesPanel({ productId, images }: ImagesPanelProps) {
  const attachMutation = useAttachImageMutation(productId)
  const setPrimaryMutation = useSetPrimaryImageMutation(productId)
  const removeMutation = useRemoveImageMutation(productId)
  const [isUploading, setIsUploading] = useState(false)

  async function handleFilesSelected(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setIsUploading(true)
    try {
      // Sequential, not Promise.all: keeps "first upload becomes primary"
      // deterministic and avoids hammering the API with parallel uploads.
      for (const [index, file] of files.entries()) {
        const media = await mediaApi.upload(file)
        await attachMutation.mutateAsync({ mediaId: media.id, isPrimary: images.length === 0 && index === 0 })
      }
      toast.success(files.length > 1 ? 'Images uploaded' : 'Image uploaded')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  async function handleSetPrimary(imageId: string) {
    try {
      await setPrimaryMutation.mutateAsync(imageId)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to set primary image')
    }
  }

  async function handleRemove(imageId: string) {
    try {
      await removeMutation.mutateAsync(imageId)
      toast.success('Image removed')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to remove image')
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {images.map((image) => (
        <div
          key={image.id}
          className="group relative size-28 shrink-0 overflow-hidden rounded-lg border border-slate-200"
        >
          <img src={image.url} alt={image.alt_text ?? ''} className="size-full object-cover" />
          {image.is_primary && (
            <span className="absolute top-1 left-1 rounded-full bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
              Primary
            </span>
          )}
          <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            {!image.is_primary && (
              <button
                type="button"
                onClick={() => handleSetPrimary(image.id)}
                title="Set as primary"
                className="rounded-md bg-white/90 p-1.5 text-slate-700 hover:bg-white"
              >
                <Star size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => handleRemove(image.id)}
              title="Remove"
              className="rounded-md bg-white/90 p-1.5 text-red-600 hover:bg-white"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      <label className="flex size-28 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-slate-400 transition hover:border-slate-400 hover:text-slate-600">
        <Upload size={18} />
        <span className="text-xs">{isUploading ? 'Uploading...' : 'Upload'}</span>
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
  )
}
