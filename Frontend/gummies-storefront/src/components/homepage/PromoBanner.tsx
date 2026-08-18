import { Truck } from 'lucide-react'
import { SmartLink } from '@/components/ui/SmartLink'
import type { PromoBannerConfig } from '@/types/homepage'

export function PromoBanner({ config }: { config: PromoBannerConfig }) {
  if (!config.text) return null

  return (
    <section className="flex flex-wrap items-center gap-3 rounded-xl border-l-4 border-orange-500 bg-white px-6 py-4 shadow-sm">
      <Truck size={20} className="shrink-0 text-orange-500" />
      <p className="flex-1 text-sm font-medium text-slate-700">{config.text}</p>
      {config.ctaText && config.ctaUrl && (
        <SmartLink to={config.ctaUrl} className="text-sm font-semibold text-blue-700 hover:underline">
          {config.ctaText}
        </SmartLink>
      )}
    </section>
  )
}
