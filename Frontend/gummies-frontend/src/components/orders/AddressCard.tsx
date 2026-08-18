import type { Address } from '@/types/order'

export function AddressCard({ title, address }: { title: string; address: Address | null }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {address ? (
        <div className="mt-2 text-sm text-slate-600">
          <p>{address.fullName}</p>
          <p>{address.line1}</p>
          {address.line2 && <p>{address.line2}</p>}
          <p>
            {address.city}, {address.state} {address.postalCode}
          </p>
          <p>{address.country}</p>
          {address.phone && <p className="mt-1 text-slate-500">{address.phone}</p>}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-400">Same as shipping address</p>
      )}
    </div>
  )
}
