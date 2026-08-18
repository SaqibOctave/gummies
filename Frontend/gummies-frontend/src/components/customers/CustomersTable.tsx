import { Eye } from 'lucide-react'
import { formatDate } from '@/lib/format'
import type { Customer } from '@/types/customer'

interface CustomersTableProps {
  customers: Customer[]
  onView: (customer: Customer) => void
}

export function CustomersTable({ customers, onView }: CustomersTableProps) {
  if (customers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center">
        <p className="text-sm text-slate-500">No customers found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium tracking-wide text-slate-500 uppercase">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Customer since</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onView(customer)}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {customer.name}
                </button>
              </td>
              <td className="px-4 py-3 text-slate-500">{customer.email}</td>
              <td className="px-4 py-3 text-slate-500">{customer.phone ?? '—'}</td>
              <td className="px-4 py-3 text-slate-500">{formatDate(customer.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onView(customer)}
                    title="View"
                    className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Eye size={16} />
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
