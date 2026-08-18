import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { OrderSummary } from '@/components/orders/OrderSummary'
import type { OrderWithItems } from '@/types/order'

export function OrderConfirmation() {
  const location = useLocation()
  const order = (location.state as { order?: OrderWithItems } | null)?.order

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-slate-500">
          We don't have an order to show here. If you just placed one, check your email for the order number.
        </p>
        <Link to="/track-order" className="mt-4 inline-block text-sm font-medium text-blue-700 hover:underline">
          Track your order
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <CheckCircle2 className="mx-auto text-emerald-500" size={40} />
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Thanks for your order!</h1>
        <p className="mt-1 text-sm text-slate-500">
          A confirmation has been sent to {order.contact_email}. Save your order number to track it later.
        </p>
      </div>

      <div className="mt-8">
        <OrderSummary order={order} />
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/products"
          className="inline-flex items-center rounded-md bg-blue-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-800"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
