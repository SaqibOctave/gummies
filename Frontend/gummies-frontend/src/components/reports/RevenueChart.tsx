import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { formatDate, formatMoney } from '@/lib/format'
import type { RevenuePoint } from '@/types/reports'

const WIDTH = 720
const HEIGHT = 220
const PADDING = { top: 12, right: 12, bottom: 24, left: 56 }
const SEQUENTIAL_BLUE = '#2a78d6'
const GRIDLINE = '#e1e0d9'
const AXIS_INK = '#898781'
const CROSSHAIR = '#c3c2b7'
const SURFACE = '#ffffff'

function niceCeil(value: number): number {
  if (value <= 0) return 10
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return niceNormalized * magnitude
}

function compactCurrency(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`
  return `$${value}`
}

function formatDayLabel(day: string): string {
  return new Date(day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

interface RevenueChartProps {
  data: RevenuePoint[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [showTable, setShowTable] = useState(false)

  if (data.length === 0) {
    return <p className="text-sm text-slate-400">No orders in this range.</p>
  }

  const innerWidth = WIDTH - PADDING.left - PADDING.right
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 0)
  const yMax = niceCeil(maxRevenue)
  const yTicks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax]

  const xStep = data.length > 1 ? innerWidth / (data.length - 1) : 0
  const xFor = (i: number) => PADDING.left + i * xStep
  const yFor = (v: number) => PADDING.top + innerHeight - (v / yMax) * innerHeight

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(d.revenue)}`).join(' ')
  const areaPath = `${linePath} L ${xFor(data.length - 1)} ${PADDING.top + innerHeight} L ${xFor(0)} ${PADDING.top + innerHeight} Z`

  // Show at most ~6 x-axis labels so dense ranges (90 days) don't collide.
  const labelStride = Math.max(Math.ceil(data.length / 6), 1)

  function handleMouseMove(e: MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const scaleX = WIDTH / rect.width
    const localX = (e.clientX - rect.left) * scaleX
    const idx = Math.round((localX - PADDING.left) / (xStep || 1))
    setHoverIndex(Math.min(Math.max(idx, 0), data.length - 1))
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null
  const tooltipLeftPct = hoverIndex !== null ? (xFor(hoverIndex) / WIDTH) * 100 : 0

  return (
    <div>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={PADDING.left} x2={WIDTH - PADDING.right} y1={yFor(t)} y2={yFor(t)} stroke={GRIDLINE} strokeWidth={1} />
              <text x={PADDING.left - 8} y={yFor(t)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill={AXIS_INK}>
                {compactCurrency(Math.round(t))}
              </text>
            </g>
          ))}

          {data.map(
            (d, i) =>
              i % labelStride === 0 && (
                <text key={d.day} x={xFor(i)} y={HEIGHT - 6} textAnchor="middle" fontSize={10} fill={AXIS_INK}>
                  {formatDayLabel(d.day)}
                </text>
              )
          )}

          <path d={areaPath} fill={SEQUENTIAL_BLUE} fillOpacity={0.1} stroke="none" />
          <path d={linePath} fill="none" stroke={SEQUENTIAL_BLUE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {hovered && hoverIndex !== null && (
            <>
              <line
                x1={xFor(hoverIndex)}
                x2={xFor(hoverIndex)}
                y1={PADDING.top}
                y2={PADDING.top + innerHeight}
                stroke={CROSSHAIR}
                strokeWidth={1}
              />
              <circle cx={xFor(hoverIndex)} cy={yFor(hovered.revenue)} r={4} fill={SEQUENTIAL_BLUE} stroke={SURFACE} strokeWidth={2} />
            </>
          )}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute top-2 -translate-x-1/2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs whitespace-nowrap shadow-md"
            style={{ left: `${tooltipLeftPct}%` }}
          >
            <p className="font-semibold text-slate-900">{formatMoney(hovered.revenue)}</p>
            <p className="text-slate-500">
              {formatDayLabel(hovered.day)} &middot; {hovered.orderCount} order{hovered.orderCount === 1 ? '' : 's'}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowTable((v) => !v)}
        className="mt-2 text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline"
      >
        {showTable ? 'Hide data table' : 'View as table'}
      </button>

      {showTable && (
        <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="text-slate-500">
                <th className="px-3 py-1.5 font-medium">Date</th>
                <th className="px-3 py-1.5 font-medium">Orders</th>
                <th className="px-3 py-1.5 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((d) => (
                <tr key={d.day}>
                  <td className="px-3 py-1.5 text-slate-700">{formatDate(d.day)}</td>
                  <td className="px-3 py-1.5 text-slate-700 tabular-nums">{d.orderCount}</td>
                  <td className="px-3 py-1.5 text-right font-medium text-slate-900 tabular-nums">
                    {formatMoney(d.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
