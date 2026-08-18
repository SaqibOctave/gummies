import { formatDateTime } from '@/lib/format'
import type { AuditLog } from '@/types/auditLog'

const ACTION_VERB_CLASS: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
}

function actionBadgeClass(action: string): string {
  const verb = action.split('.').pop() ?? ''
  return ACTION_VERB_CLASS[verb] ?? 'bg-slate-100 text-slate-700'
}

interface AuditLogsTableProps {
  logs: AuditLog[]
  adminNameById: Map<string, string>
  onSelect: (log: AuditLog) => void
}

export function AuditLogsTable({ logs, adminNameById, onSelect }: AuditLogsTableProps) {
  if (logs.length === 0) {
    return <p className="text-sm text-slate-500">No audit log entries found.</p>
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr className="text-slate-500">
            <th className="px-4 py-2.5 font-medium">Timestamp</th>
            <th className="px-4 py-2.5 font-medium">Admin</th>
            <th className="px-4 py-2.5 font-medium">Action</th>
            <th className="px-4 py-2.5 font-medium">Entity</th>
            <th className="px-4 py-2.5 font-medium">IP</th>
            <th className="px-4 py-2.5 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-4 py-2.5 whitespace-nowrap text-slate-600">{formatDateTime(log.created_at)}</td>
              <td className="px-4 py-2.5 text-slate-900">
                {log.admin_id ? (adminNameById.get(log.admin_id) ?? 'Unknown admin') : 'System'}
              </td>
              <td className="px-4 py-2.5">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-xs font-medium ${actionBadgeClass(log.action)}`}
                >
                  {log.action}
                </span>
              </td>
              <td className="px-4 py-2.5 text-slate-600">
                {log.entity_type}
                {log.entity_id && (
                  <span className="ml-1 font-mono text-xs text-slate-400">
                    {log.entity_id.slice(0, 8)}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5 text-slate-500">{log.ip_address ?? '—'}</td>
              <td className="px-4 py-2.5 text-right">
                <button
                  type="button"
                  onClick={() => onSelect(log)}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
                >
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
