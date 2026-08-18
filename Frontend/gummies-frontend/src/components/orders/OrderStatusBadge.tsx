import { ORDER_STATUS_BADGE_CLASS, ORDER_STATUS_LABEL } from '@/types/order'
import type { OrderStatus } from '@/types/order'

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_BADGE_CLASS[status]}`}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  )
}
