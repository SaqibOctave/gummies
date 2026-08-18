import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex size-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-slate-500">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex size-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
