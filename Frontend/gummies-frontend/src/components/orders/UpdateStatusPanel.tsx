import { useState } from 'react'
import { toast } from 'sonner'
import { useUpdateOrderStatusMutation } from '@/hooks/useOrders'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ApiError } from '@/api/httpClient'
import { ORDER_STATUS_LABEL, ORDER_STATUS_TRANSITIONS } from '@/types/order'
import type { OrderStatus } from '@/types/order'

const DESTRUCTIVE_STATUSES: OrderStatus[] = ['cancelled', 'refunded']

interface UpdateStatusPanelProps {
  orderId: string
  status: OrderStatus
}

export function UpdateStatusPanel({ orderId, status }: UpdateStatusPanelProps) {
  const mutation = useUpdateOrderStatusMutation(orderId)
  const [note, setNote] = useState('')
  const [confirmTarget, setConfirmTarget] = useState<OrderStatus | null>(null)

  const nextStatuses = ORDER_STATUS_TRANSITIONS[status]

  async function applyStatus(target: OrderStatus) {
    try {
      await mutation.mutateAsync({ status: target, note: note || undefined })
      toast.success(`Order marked as ${ORDER_STATUS_LABEL[target]}`)
      setNote('')
      setConfirmTarget(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update order status')
    }
  }

  function handleClick(target: OrderStatus) {
    if (DESTRUCTIVE_STATUSES.includes(target)) {
      setConfirmTarget(target)
    } else {
      applyStatus(target)
    }
  }

  if (nextStatuses.length === 0) {
    return <p className="text-sm text-slate-500">No further status changes are available for this order.</p>
  }

  return (
    <div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Note (optional)</label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Visible in the order's status history"
          className="mt-1 w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {nextStatuses.map((target) => (
          <button
            key={target}
            type="button"
            onClick={() => handleClick(target)}
            disabled={mutation.isPending}
            className={[
              'rounded-md px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
              DESTRUCTIVE_STATUSES.includes(target)
                ? 'border border-red-200 bg-white text-red-600 hover:bg-red-50'
                : 'bg-slate-900 text-white hover:bg-slate-800',
            ].join(' ')}
          >
            Mark as {ORDER_STATUS_LABEL[target]}
          </button>
        ))}
      </div>

      <ConfirmDialog
        open={confirmTarget !== null}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={`Mark order as ${confirmTarget ? ORDER_STATUS_LABEL[confirmTarget] : ''}`}
        description={
          confirmTarget === 'cancelled'
            ? 'This releases any reserved stock for this order. This cannot be undone.'
            : confirmTarget === 'refunded'
              ? 'This marks the order as refunded. This cannot be undone.'
              : undefined
        }
        confirmLabel="Confirm"
        isLoading={mutation.isPending}
        onConfirm={() => confirmTarget && applyStatus(confirmTarget)}
      />
    </div>
  )
}
