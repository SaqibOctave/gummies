import { useAdminsQuery } from '@/hooks/useAdmins'

export interface AuditLogFilterValues {
  entityType: string
  entityId: string
  action: string
  adminId: string
}

interface AuditLogFiltersProps {
  values: AuditLogFilterValues
  onChange: (values: AuditLogFilterValues) => void
}

export function AuditLogFilters({ values, onChange }: AuditLogFiltersProps) {
  const adminsQuery = useAdminsQuery({ page: 1, limit: 100 })
  const admins = adminsQuery.data?.data ?? []

  function set<K extends keyof AuditLogFilterValues>(key: K, value: AuditLogFilterValues[K]) {
    onChange({ ...values, [key]: value })
  }

  const hasFilters = Object.values(values).some(Boolean)

  return (
    <div className="mt-6 flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-slate-500">Entity type</label>
        <input
          value={values.entityType}
          onChange={(e) => set('entityType', e.target.value)}
          placeholder="e.g. product"
          className="mt-1 w-36 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500">Action</label>
        <input
          value={values.action}
          onChange={(e) => set('action', e.target.value)}
          placeholder="e.g. product.update"
          className="mt-1 w-44 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500">Entity ID</label>
        <input
          value={values.entityId}
          onChange={(e) => set('entityId', e.target.value)}
          placeholder="UUID"
          className="mt-1 w-56 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500">Admin</label>
        <select
          value={values.adminId}
          onChange={(e) => set('adminId', e.target.value)}
          className="mt-1 w-44 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        >
          <option value="">All admins</option>
          {admins.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.name}
            </option>
          ))}
        </select>
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={() => onChange({ entityType: '', entityId: '', action: '', adminId: '' })}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
