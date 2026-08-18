import { Heart, Headset, Sparkles, Truck } from 'lucide-react'
import { usePublicSettingsQuery } from '@/hooks/useSettings'
import { formatMoney } from '@/lib/format'

export function FeatureStrip() {
  const settingsQuery = usePublicSettingsQuery()
  const threshold = settingsQuery.data?.free_shipping_threshold

  const features = [
    { icon: Sparkles, title: 'Made with real fruit', subtitle: 'No artificial junk, ever' },
    {
      icon: Truck,
      title: 'Fast shipping',
      subtitle: threshold ? `Free over ${formatMoney(threshold, settingsQuery.data?.store_currency)}` : 'Free on qualifying orders',
    },
    { icon: Heart, title: 'Made in small batches', subtitle: 'Fresh, never stockpiled' },
    { icon: Headset, title: 'Friendly support', subtitle: "We're here if you need us" },
  ]

  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {features.map((feature) => (
        <div key={feature.title} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <feature.icon size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{feature.title}</p>
            <p className="text-xs text-slate-500">{feature.subtitle}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
