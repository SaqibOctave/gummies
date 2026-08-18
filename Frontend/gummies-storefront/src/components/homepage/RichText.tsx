import type { RichTextConfig } from '@/types/homepage'

export function RichText({ title, config }: { title: string | null; config: RichTextConfig }) {
  if (!config.content) return null

  return (
    <section className="rounded-2xl bg-slate-50 px-8 py-10 text-center">
      {title && <h2 className="text-xl font-semibold text-slate-900">{title}</h2>}
      <div className="mx-auto mt-3 max-w-2xl space-y-3 text-sm text-slate-600">
        {config.content.split('\n').filter(Boolean).map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </section>
  )
}
