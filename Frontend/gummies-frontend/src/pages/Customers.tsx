import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Search } from 'lucide-react'
import { useCustomersQuery } from '@/hooks/useCustomers'
import { CustomersTable } from '@/components/customers/CustomersTable'
import { Pagination } from '@/components/ui/Pagination'
import type { Customer } from '@/types/customer'

const PAGE_SIZE = 20

export function Customers() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const { data, isLoading, isError, isFetching, refetch } = useCustomersQuery({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
  })

  function handleView(customer: Customer) {
    navigate(`/customers/${customer.id}`)
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">Guest customers created through checkout.</p>
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

      <div className="relative mt-6 max-w-sm">
        <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name or email..."
          className="w-full rounded-md border border-slate-300 py-2 pr-3 pl-9 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Failed to load customers.</p>
        ) : (
          <>
            <CustomersTable customers={data?.data ?? []} onView={handleView} />
            {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
          </>
        )}
      </div>
    </div>
  )
}
