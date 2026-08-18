import { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useAdminsQuery } from '@/hooks/useAdmins'
import { AdminsTable } from '@/components/admins/AdminsTable'
import { AdminFormDialog } from '@/components/admins/AdminFormDialog'
import { Pagination } from '@/components/ui/Pagination'
import type { Admin } from '@/types/admin'

const PAGE_SIZE = 20

export function Admins() {
  const { admin: currentAdmin } = useAuth()
  const canManage = currentAdmin?.role === 'super_admin'

  const [page, setPage] = useState(1)
  const [formState, setFormState] = useState<{ open: boolean; admin?: Admin }>({ open: false })

  const { data, isLoading, isError, isFetching, refetch } = useAdminsQuery({ page, limit: PAGE_SIZE })

  return (
    <div className="px-6 py-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Admins</h1>
          <p className="mt-1 text-sm text-slate-500">Manage admin users and their access levels.</p>
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
          {canManage && (
            <button
              type="button"
              onClick={() => setFormState({ open: true })}
              className="flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus size={16} />
              Add admin
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Failed to load admins.</p>
        ) : (
          <>
            <AdminsTable
              admins={data?.data ?? []}
              currentAdminId={currentAdmin?.id ?? ''}
              canManage={canManage}
              onEdit={(admin) => setFormState({ open: true, admin })}
            />
            {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
          </>
        )}
      </div>

      {canManage && (
        <AdminFormDialog
          key={formState.admin?.id ?? 'create'}
          open={formState.open}
          onOpenChange={(open) => setFormState((prev) => ({ ...prev, open }))}
          admin={formState.admin}
          currentAdminId={currentAdmin?.id ?? ''}
        />
      )}
    </div>
  )
}
