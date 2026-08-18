import { useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useAuditLogsQuery } from '@/hooks/useAuditLogs'
import { useAdminsQuery } from '@/hooks/useAdmins'
import { AuditLogFilters } from '@/components/audit/AuditLogFilters'
import type { AuditLogFilterValues } from '@/components/audit/AuditLogFilters'
import { AuditLogsTable } from '@/components/audit/AuditLogsTable'
import { AuditLogDetailDialog } from '@/components/audit/AuditLogDetailDialog'
import { Pagination } from '@/components/ui/Pagination'
import type { AuditLog } from '@/types/auditLog'

const PAGE_SIZE = 20
const EMPTY_FILTERS: AuditLogFilterValues = { entityType: '', entityId: '', action: '', adminId: '' }

export function AuditLogs() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<AuditLogFilterValues>(EMPTY_FILTERS)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  const { data, isLoading, isError, isFetching, refetch } = useAuditLogsQuery({
    page,
    limit: PAGE_SIZE,
    entityType: filters.entityType || undefined,
    entityId: filters.entityId || undefined,
    action: filters.action || undefined,
    adminId: filters.adminId || undefined,
  })

  const adminsQuery = useAdminsQuery({ page: 1, limit: 100 })
  const adminNameById = useMemo(
    () => new Map((adminsQuery.data?.data ?? []).map((a) => [a.id, a.name])),
    [adminsQuery.data]
  )

  function handleFiltersChange(next: AuditLogFilterValues) {
    setFilters(next)
    setPage(1)
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-slate-500">A record of admin actions across the store.</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          title="Refresh"
          className="flex size-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      <AuditLogFilters values={filters} onChange={handleFiltersChange} />

      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Failed to load audit logs.</p>
        ) : (
          <>
            <AuditLogsTable
              logs={data?.data ?? []}
              adminNameById={adminNameById}
              onSelect={setSelectedLog}
            />
            {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
          </>
        )}
      </div>

      <AuditLogDetailDialog
        open={Boolean(selectedLog)}
        onOpenChange={(open) => !open && setSelectedLog(null)}
        log={selectedLog}
        adminName={
          selectedLog?.admin_id ? (adminNameById.get(selectedLog.admin_id) ?? 'Unknown admin') : 'System'
        }
      />
    </div>
  )
}
