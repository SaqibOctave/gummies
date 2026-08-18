import { useState } from 'react'
import type { FormEvent } from 'react'
import { toast } from 'sonner'
import { Dialog } from '@/components/ui/Dialog'
import {
  useAdjustMutation,
  useInventoryDetailQuery,
  useInventoryMovementsQuery,
  useRestockMutation,
  useSetThresholdMutation,
} from '@/hooks/useInventory'
import { ApiError } from '@/api/httpClient'
import type { InventoryMovementReason } from '@/types/inventory'

interface ManageStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variantId: string
  productName: string
  variantName: string
  sku: string
}

const REASON_LABEL: Record<InventoryMovementReason, string> = {
  restock: 'Restock',
  manual_adjustment: 'Manual adjustment',
  order_reserved: 'Order reserved',
  order_released: 'Order released',
  order_fulfilled: 'Order fulfilled',
  correction: 'Correction',
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center">
      <p className="text-lg font-semibold text-slate-900">{value}</p>
      <p className="text-[11px] tracking-wide text-slate-500 uppercase">{label}</p>
    </div>
  )
}

export function ManageStockDialog({
  open,
  onOpenChange,
  variantId,
  productName,
  variantName,
  sku,
}: ManageStockDialogProps) {
  const { data: inventory } = useInventoryDetailQuery(variantId)
  const { data: movements = [] } = useInventoryMovementsQuery(variantId)

  const restockMutation = useRestockMutation(variantId)
  const adjustMutation = useAdjustMutation(variantId)
  const thresholdMutation = useSetThresholdMutation(variantId)

  const [restockQuantity, setRestockQuantity] = useState('')
  const [restockNote, setRestockNote] = useState('')
  const [adjustDelta, setAdjustDelta] = useState('')
  const [adjustNote, setAdjustNote] = useState('')
  const [threshold, setThreshold] = useState('')

  const available = inventory ? inventory.quantity_on_hand - inventory.quantity_reserved : 0

  async function handleRestock(e: FormEvent) {
    e.preventDefault()
    const quantity = Number(restockQuantity)
    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error('Enter a positive whole number')
      return
    }
    try {
      await restockMutation.mutateAsync({ quantity, note: restockNote || undefined })
      toast.success('Stock added')
      setRestockQuantity('')
      setRestockNote('')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to restock')
    }
  }

  async function handleAdjust(e: FormEvent) {
    e.preventDefault()
    const delta = Number(adjustDelta)
    if (!Number.isInteger(delta) || delta === 0) {
      toast.error('Enter a non-zero whole number (negative to reduce stock)')
      return
    }
    try {
      await adjustMutation.mutateAsync({ delta, note: adjustNote || undefined })
      toast.success('Stock adjusted')
      setAdjustDelta('')
      setAdjustNote('')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to adjust stock')
    }
  }

  async function handleSetThreshold(e: FormEvent) {
    e.preventDefault()
    const value = Number(threshold)
    if (!Number.isInteger(value) || value < 0) {
      toast.error('Enter a whole number of 0 or more')
      return
    }
    try {
      await thresholdMutation.mutateAsync(value)
      toast.success('Threshold updated')
      setThreshold('')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update threshold')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Manage stock"
      description={`${productName} — ${variantName} (${sku})`}
      size="lg"
    >
      <div className="grid grid-cols-4 gap-2">
        <StatTile label="On hand" value={inventory?.quantity_on_hand ?? 0} />
        <StatTile label="Reserved" value={inventory?.quantity_reserved ?? 0} />
        <StatTile label="Available" value={available} />
        <StatTile label="Threshold" value={inventory?.low_stock_threshold ?? 0} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <form onSubmit={handleRestock} className="space-y-2 rounded-md border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-900">Restock</h3>
          <input
            type="number"
            min={1}
            placeholder="Quantity"
            value={restockQuantity}
            onChange={(e) => setRestockQuantity(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={restockNote}
            onChange={(e) => setRestockNote(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
          <button
            type="submit"
            disabled={restockMutation.isPending}
            className="w-full rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {restockMutation.isPending ? 'Adding...' : 'Add stock'}
          </button>
        </form>

        <form onSubmit={handleAdjust} className="space-y-2 rounded-md border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-900">Manual adjustment</h3>
          <input
            type="number"
            placeholder="Delta (e.g. -3)"
            value={adjustDelta}
            onChange={(e) => setAdjustDelta(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={adjustNote}
            onChange={(e) => setAdjustNote(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
          <button
            type="submit"
            disabled={adjustMutation.isPending}
            className="w-full rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {adjustMutation.isPending ? 'Applying...' : 'Apply adjustment'}
          </button>
        </form>
      </div>

      <form onSubmit={handleSetThreshold} className="mt-4 flex items-end gap-2 rounded-md border border-slate-200 p-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700">Low stock threshold</label>
          <input
            type="number"
            min={0}
            placeholder={String(inventory?.low_stock_threshold ?? 0)}
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <button
          type="submit"
          disabled={thresholdMutation.isPending}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {thresholdMutation.isPending ? 'Saving...' : 'Save'}
        </button>
      </form>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-slate-900">Recent movements</h3>
        {movements.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No stock movements yet.</p>
        ) : (
          <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-slate-200">
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-slate-100">
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td className="px-3 py-2 text-slate-500">
                      {new Date(m.created_at).toLocaleString(undefined, {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{REASON_LABEL[m.reason]}</td>
                    <td
                      className={`px-3 py-2 text-right font-medium ${
                        m.change_quantity >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {m.change_quantity >= 0 ? '+' : ''}
                      {m.change_quantity}
                    </td>
                    <td className="px-3 py-2 text-slate-500">{m.note ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Dialog>
  )
}
