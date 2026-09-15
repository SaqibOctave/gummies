import { SmartLink } from '@/components/ui/SmartLink'
import type { HeroBannerConfig } from '@/types/homepage'

export function HeroBanner({ config }: { config: HeroBannerConfig }) {
  return (
    <section className="relative isolate flex min-h-105 items-center overflow-hidden rounded-3xl bg-blue-800 sm:min-h-135">
      {config.imageUrl && (
        <img src={config.imageUrl} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
      )}
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/85 via-black/55 via-45% to-transparent" />

      <div className="max-w-xl px-8 py-14 sm:px-14 sm:py-20">
        <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-bold tracking-wide text-blue-900 uppercase">
          Small-batch &amp; delicious
        </span>
        {config.headline && (
          <h1 className="mt-5 text-4xl leading-[1.05] font-extrabold text-white sm:text-5xl">{config.headline}</h1>
        )}
        {config.subheadline && <p className="mt-4 max-w-md text-base text-white/90">{config.subheadline}</p>}
        {config.ctaText && config.ctaUrl && (
          <div className="mt-7 flex flex-wrap gap-3">
            <SmartLink
              to={config.ctaUrl}
              className="inline-flex items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              {config.ctaText}
            </SmartLink>
            <SmartLink
              to="/products"
              className="inline-flex items-center rounded-full border border-white/70 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View all products
            </SmartLink>
          </div>
        )}
      </div>
    </section>
  )
}
