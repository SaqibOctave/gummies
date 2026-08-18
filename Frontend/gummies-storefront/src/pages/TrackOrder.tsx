import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { OrderSummary } from '@/components/orders/OrderSummary'
import * as ordersApi from '@/api/orders'
import { ApiError } from '@/api/httpClient'
import type { OrderWithItems } from '@/types/order'

const lookupFormSchema = z.object({
  orderNumber: z.string().min(1, 'Required'),
  email: z.email('Enter a valid email'),
})

type LookupFormValues = z.infer<typeof lookupFormSchema>

export function TrackOrder() {
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LookupFormValues>({ resolver: zodResolver(lookupFormSchema) })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    setOrder(null)
    setIsLoading(true)
    try {
      const result = await ordersApi.lookup(values.orderNumber.trim(), values.email.trim())
      setOrder(result)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'We could not find that order.')
    } finally {
      setIsLoading(false)
    }
  })

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-900">Track your order</h1>
      <p className="mt-1 text-sm text-slate-500">
        Enter your order number and the email you used at checkout.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <label className="block text-xs font-medium text-slate-600">Order number</label>
          <input
            {...register('orderNumber')}
            placeholder="GUM-20260817-8DF0A9"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {errors.orderNumber && <p className="mt-1 text-xs text-red-600">{errors.orderNumber.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Email</label>
          <input
            type="email"
            {...register('email')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-blue-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Searching...' : 'Find my order'}
        </button>
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
      </form>

      {order && (
        <div className="mt-8">
          <OrderSummary order={order} />
        </div>
      )}
    </div>
  )
}
