import { useState } from 'react'

interface BarDatum {
  label: string
  value: number
  color: string
}

interface HorizontalBarChartProps {
  data: BarDatum[]
  valueFormatter?: (value: number) => string
  emptyLabel?: string
}

// Ranked/categorical magnitude bars. Every bar is direct-labeled (value at
// the tip), so - per the dataviz skill - no separate hover tooltip is
// needed here: everything a tooltip would show is already always visible.
export function HorizontalBarChart({ data, valueFormatter = String, emptyLabel }: HorizontalBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return <p className="text-sm text-slate-400">{emptyLabel ?? 'No data yet.'}</p>
  }

  return (
    <div className="space-y-2.5">
      {data.map((d, i) => {
        const widthPct = Math.max((d.value / maxValue) * 100, 1.5)
        return (
          <div
            key={d.label}
            className="flex items-center gap-3"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="w-28 shrink-0 truncate text-xs text-slate-600" title={d.label}>
              {d.label}
            </div>
            <div className="h-4 flex-1 rounded-sm bg-slate-50">
              <div
                className="h-4 rounded-r-[4px] transition-[width,opacity]"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: d.color,
                  opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.55,
                }}
              />
            </div>
            <div className="w-16 shrink-0 text-right text-xs font-medium text-slate-900 tabular-nums">
              {valueFormatter(d.value)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
