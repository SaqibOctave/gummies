import { SmartLink } from '@/components/ui/SmartLink'
import type { HeroBannerConfig } from '@/types/homepage'

export function HeroBanner({ config }: { config: HeroBannerConfig }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-blue-800">
      <div className="grid items-center gap-8 px-8 py-14 sm:px-14 sm:py-20 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center rounded-md bg-orange-500 px-3 py-1 text-xs font-bold tracking-wide text-white uppercase">
            Small-batch &amp; delicious
          </span>
          {config.headline && (
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">{config.headline}</h1>
          )}
          {config.subheadline && <p className="mt-4 text-base text-blue-100">{config.subheadline}</p>}
          {config.ctaText && config.ctaUrl && (
            <div className="mt-6 flex flex-wrap gap-3">
              <SmartLink
                to={config.ctaUrl}
                className="inline-flex items-center rounded-md bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                {config.ctaText}
              </SmartLink>
              <SmartLink
                to="/products"
                className="inline-flex items-center rounded-md border border-blue-300 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                View all products
              </SmartLink>
            </div>
          )}
        </div>
        {config.imageUrl && (
          <div className="aspect-4/3 overflow-hidden rounded-2xl">
            <img src={config.imageUrl} alt="" className="size-full object-cover" />
          </div>
        )}
      </div>
    </section>
  )
}
