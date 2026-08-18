import { Copy, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Media } from '@/types/media'

interface MediaGridProps {
  items: Media[]
  onDelete: (media: Media) => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaGrid({ items, onDelete }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center">
        <p className="text-sm text-slate-500">No media uploaded yet.</p>
      </div>
    )
  }

  async function handleCopyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('URL copied')
    } catch {
      toast.error('Failed to copy URL')
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((media) => (
        <div key={media.id} className="group overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="relative aspect-square bg-slate-50">
            <img src={media.url} alt={media.alt_text ?? ''} className="size-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => handleCopyUrl(media.url)}
                title="Copy URL"
                className="rounded-md bg-white/90 p-1.5 text-slate-700 hover:bg-white"
              >
                <Copy size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(media)}
                title="Delete"
                className="rounded-md bg-white/90 p-1.5 text-red-600 hover:bg-white"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="p-2">
            <p className="truncate text-xs font-medium text-slate-700" title={media.original_name}>
              {media.original_name}
            </p>
            <p className="text-[11px] text-slate-400">{formatBytes(media.size_bytes)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
