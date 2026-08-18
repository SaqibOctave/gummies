import { formatDate } from '@/lib/format'
import { ADMIN_ROLE_BADGE_CLASS, ADMIN_ROLE_LABEL } from '@/types/admin'
import type { Admin } from '@/types/admin'

interface AdminsTableProps {
  admins: Admin[]
  currentAdminId: string
  canManage: boolean
  onEdit: (admin: Admin) => void
}

export function AdminsTable({ admins, currentAdminId, canManage, onEdit }: AdminsTableProps) {
  if (admins.length === 0) {
    return <p className="text-sm text-slate-500">No admins found.</p>
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr className="text-slate-500">
            <th className="px-4 py-2.5 font-medium">Name</th>
            <th className="px-4 py-2.5 font-medium">Email</th>
            <th className="px-4 py-2.5 font-medium">Role</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Created</th>
            {canManage && <th className="px-4 py-2.5 font-medium" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {admins.map((admin) => (
            <tr key={admin.id}>
              <td className="px-4 py-2.5 font-medium text-slate-900">
                {admin.name}
                {admin.id === currentAdminId && <span className="ml-2 text-xs font-normal text-slate-400">(You)</span>}
              </td>
              <td className="px-4 py-2.5 text-slate-600">{admin.email}</td>
              <td className="px-4 py-2.5">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ADMIN_ROLE_BADGE_CLASS[admin.role]}`}
                >
                  {ADMIN_ROLE_LABEL[admin.role]}
                </span>
              </td>
              <td className="px-4 py-2.5">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    admin.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {admin.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-2.5 text-slate-600">{formatDate(admin.created_at)}</td>
              {canManage && (
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(admin)}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    Edit
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
