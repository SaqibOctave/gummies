import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useInventoryQuery } from '@/hooks/useInventory'
import { InventoryTable } from '@/components/inventory/InventoryTable'
import { ManageStockDialog } from '@/components/inventory/ManageStockDialog'
import { Pagination } from '@/components/ui/Pagination'
import type { InventoryWithProductInfo } from '@/types/inventory'

const PAGE_SIZE = 20

export function Inventory() {
  const [page, setPage] = useState(1)
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [managing, setManaging] = useState<InventoryWithProductInfo | null>(null)

  const { data, isLoading, isError, isFetching, refetch } = useInventoryQuery({
    page,
    limit: PAGE_SIZE,
    lowStockOnly,
  })

  return (
    <div className="px-6 py-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">Track and adjust stock levels per variant.</p>
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

      <label className="mt-6 flex w-fit items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={lowStockOnly}
          onChange={(e) => {
            setLowStockOnly(e.target.checked)
            setPage(1)
          }}
          className="size-4 rounded border-slate-300"
        />
        Low stock only
      </label>

      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Failed to load inventory.</p>
        ) : (
          <>
            <InventoryTable items={data?.data ?? []} onManage={(item) => setManaging(item)} />
            {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />}
          </>
        )}
      </div>

      {managing && (
        <ManageStockDialog
          key={managing.variant_id}
          open={Boolean(managing)}
          onOpenChange={(open) => !open && setManaging(null)}
          variantId={managing.variant_id}
          productName={managing.product_name}
          variantName={managing.variant_name}
          sku={managing.sku}
        />
      )}
    </div>
  )
}
