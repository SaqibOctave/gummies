import { Pencil, Trash2 } from 'lucide-react'
import { formatDateTime } from '@/lib/format'
import { HOMEPAGE_BLOCK_TYPE_LABEL } from '@/types/homepage'
import type { HomepageBlock } from '@/types/homepage'

interface HomepageBlocksTableProps {
  blocks: HomepageBlock[]
  onEdit: (block: HomepageBlock) => void
  onDelete: (block: HomepageBlock) => void
}

export function HomepageBlocksTable({ blocks, onEdit, onDelete }: HomepageBlocksTableProps) {
  if (blocks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center">
        <p className="text-sm text-slate-500">No homepage blocks yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium tracking-wide text-slate-500 uppercase">
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Sort order</th>
            <th className="px-4 py-3">Schedule</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {blocks.map((block) => (
            <tr key={block.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onEdit(block)}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {block.title || <span className="text-slate-400 italic">Untitled</span>}
                </button>
              </td>
              <td className="px-4 py-3 text-slate-500">{HOMEPAGE_BLOCK_TYPE_LABEL[block.type]}</td>
              <td className="px-4 py-3">
                <span
                  className={[
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    block.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500',
                  ].join(' ')}
                >
                  {block.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">{block.sort_order}</td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {block.starts_at || block.ends_at ? (
                  <>
                    {block.starts_at ? formatDateTime(block.starts_at) : 'Always'} &rarr;{' '}
                    {block.ends_at ? formatDateTime(block.ends_at) : 'Forever'}
                  </>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(block)}
                    title="Edit"
                    className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(block)}
                    title="Delete"
                    className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
