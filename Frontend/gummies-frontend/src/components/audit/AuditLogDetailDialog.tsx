import { Dialog } from '@/components/ui/Dialog'
import { formatDateTime } from '@/lib/format'
import type { AuditLog } from '@/types/auditLog'

interface AuditLogDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: AuditLog | null
  adminName: string
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined) {
    return (
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-xs text-slate-400 italic">None</p>
      </div>
    )
  }
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <pre className="mt-1 max-h-64 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-800">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}

export function AuditLogDetailDialog({ open, onOpenChange, log, adminName }: AuditLogDetailDialogProps) {
  if (!log) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Audit log entry" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium text-slate-500">Action</p>
            <p className="mt-0.5 font-mono text-slate-900">{log.action}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">When</p>
            <p className="mt-0.5 text-slate-900">{formatDateTime(log.created_at)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Admin</p>
            <p className="mt-0.5 text-slate-900">{adminName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Entity</p>
            <p className="mt-0.5 text-slate-900">
              {log.entity_type}
              {log.entity_id && <span className="font-mono text-xs text-slate-500"> · {log.entity_id}</span>}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">IP address</p>
            <p className="mt-0.5 text-slate-900">{log.ip_address ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">User agent</p>
            <p className="mt-0.5 truncate text-slate-900" title={log.user_agent ?? ''}>
              {log.user_agent ?? '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <JsonBlock label="Before" value={log.before_data} />
          <JsonBlock label="After" value={log.after_data} />
        </div>
      </div>
    </Dialog>
  )
}
