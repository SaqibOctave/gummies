import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Navigate, useNavigate } from 'react-router-dom'
import { useCart } from '@/context/cart-context'
import { usePublicSettingsQuery } from '@/hooks/useSettings'
import { useCheckoutMutation } from '@/hooks/useOrders'
import { ApiError } from '@/api/httpClient'
import { formatMoney } from '@/lib/format'
import type { Address } from '@/types/order'

const addressSchema = z.object({
  fullName: z.string().min(2, 'Required'),
  line1: z.string().min(1, 'Required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  postalCode: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
  phone: z.string().optional(),
})

// A lenient version with no min-length checks - `addressSchema.partial()`
// only allows a key to be *missing*, not empty, and react-hook-form's
// defaultValues always provide these as '', so .partial() alone doesn't
// stop billingAddress from failing validation while "same as shipping" is
// checked. The superRefine below is what actually enforces required fields,
// only when the billing address is actually in use.
const lenientAddressSchema = z.object({
  fullName: z.string().optional(),
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
})

const checkoutFormSchema = z
  .object({
    contactName: z.string().min(2, 'Required'),
    contactEmail: z.email('Enter a valid email'),
    contactPhone: z.string().optional(),
    shippingAddress: addressSchema,
    billingSameAsShipping: z.boolean(),
    billingAddress: lenientAddressSchema,
    customerNotes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.billingSameAsShipping) return
    const required = ['fullName', 'line1', 'city', 'state', 'postalCode', 'country'] as const
    for (const key of required) {
      if (!data.billingAddress[key]) {
        ctx.addIssue({ code: 'custom', path: ['billingAddress', key], message: 'Required' })
      }
    }
  })

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'

function AddressFields({
  register,
  errors,
  prefix,
}: {
  register: ReturnType<typeof useForm<CheckoutFormValues>>['register']
  errors: FieldErrors<CheckoutFormValues['shippingAddress']>
  prefix: 'shippingAddress' | 'billingAddress'
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <label className="block text-xs font-medium text-slate-600">Full name</label>
        <input {...register(`${prefix}.fullName`)} className={inputClass} />
        {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
      </div>
      <div className="col-span-2">
        <label className="block text-xs font-medium text-slate-600">Address line 1</label>
        <input {...register(`${prefix}.line1`)} className={inputClass} />
        {errors.line1 && <p className="mt-1 text-xs text-red-600">{errors.line1.message}</p>}
      </div>
      <div className="col-span-2">
        <label className="block text-xs font-medium text-slate-600">Address line 2 (optional)</label>
        <input {...register(`${prefix}.line2`)} className={inputClass} />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">City</label>
        <input {...register(`${prefix}.city`)} className={inputClass} />
        {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">State</label>
        <input {...register(`${prefix}.state`)} className={inputClass} />
        {errors.state && <p className="mt-1 text-xs text-red-600">{errors.state.message}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Postal code</label>
        <input {...register(`${prefix}.postalCode`)} className={inputClass} />
        {errors.postalCode && <p className="mt-1 text-xs text-red-600">{errors.postalCode.message}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Country</label>
        <input {...register(`${prefix}.country`)} className={inputClass} placeholder="US" />
        {errors.country && <p className="mt-1 text-xs text-red-600">{errors.country.message}</p>}
      </div>
    </div>
  )
}

export function Checkout() {
  const { lines, subtotal, clear } = useCart()
  const settingsQuery = usePublicSettingsQuery()
  const checkoutMutation = useCheckoutMutation()
  const navigate = useNavigate()

  const currency = settingsQuery.data?.store_currency ?? 'USD'
  const flatShippingRate = settingsQuery.data?.flat_shipping_rate ?? 0
  const freeShippingThreshold = settingsQuery.data?.free_shipping_threshold ?? 0
  const taxRatePercent = settingsQuery.data?.tax_rate_percent ?? 0
  const estimatedShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold ? 0 : flatShippingRate
  const estimatedTax = (subtotal * taxRatePercent) / 100
  const estimatedTotal = subtotal + estimatedShipping + estimatedTax

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      shippingAddress: { fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'US', phone: '' },
      billingSameAsShipping: true,
      billingAddress: { fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'US', phone: '' },
      customerNotes: '',
    },
  })

  const billingSameAsShipping = watch('billingSameAsShipping')

  useEffect(() => {
    document.title = 'Checkout'
  }, [])

  // Guards against landing on checkout with an empty cart (e.g. direct nav),
  // but must not fire on the success path: clear() empties the cart right
  // before navigating to the confirmation page, and without this check that
  // re-render would redirect back to /cart instead, racing the intended
  // navigation.
  if (lines.length === 0 && !checkoutMutation.isSuccess) {
    return <Navigate to="/cart" replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const order = await checkoutMutation.mutateAsync({
        contactName: values.contactName,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone || undefined,
        shippingAddress: values.shippingAddress,
        billingAddress: values.billingSameAsShipping ? undefined : (values.billingAddress as Address),
        customerNotes: values.customerNotes || undefined,
        items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
      })
      clear()
      navigate('/order-confirmation', { state: { order } })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to place order')
    }
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Checkout</h1>

      <form onSubmit={onSubmit} className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Contact</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">Full name</label>
                <input {...register('contactName')} className={inputClass} />
                {errors.contactName && <p className="mt-1 text-xs text-red-600">{errors.contactName.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Email</label>
                <input type="email" {...register('contactEmail')} className={inputClass} />
                {errors.contactEmail && <p className="mt-1 text-xs text-red-600">{errors.contactEmail.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600">Phone (optional)</label>
                <input {...register('contactPhone')} className={inputClass} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Shipping address</h2>
            <div className="mt-4">
              <AddressFields register={register} errors={errors.shippingAddress ?? {}} prefix="shippingAddress" />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" {...register('billingSameAsShipping')} className="size-4 rounded border-slate-300" />
              Billing address same as shipping
            </label>
            {!billingSameAsShipping && (
              <div className="mt-4">
                <AddressFields register={register} errors={errors.billingAddress ?? {}} prefix="billingAddress" />
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <label className="block text-xs font-medium text-slate-600">Order notes (optional)</label>
            <textarea {...register('customerNotes')} rows={3} className={inputClass} />
          </section>
        </div>

        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Order summary</h2>
          <div className="mt-4 space-y-2 divide-y divide-slate-100">
            {lines.map((line) => (
              <div key={line.variantId} className="flex justify-between pt-2 text-sm first:pt-0">
                <span className="text-slate-600">
                  {line.productName} &times; {line.quantity}
                </span>
                <span className="font-medium text-slate-900">{formatMoney(Number(line.price) * line.quantity, currency)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Estimated shipping</span>
              <span>{formatMoney(estimatedShipping, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Estimated tax</span>
              <span>{formatMoney(estimatedTax, currency)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
              <span>Estimated total</span>
              <span>{formatMoney(estimatedTotal, currency)}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={checkoutMutation.isPending}
            className="mt-5 w-full rounded-md bg-blue-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checkoutMutation.isPending ? 'Placing order...' : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  )
}
