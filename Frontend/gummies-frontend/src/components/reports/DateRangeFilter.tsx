const PRESETS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
] as const

interface DateRangeFilterProps {
  days: number
  onChange: (days: number) => void
}

export function DateRangeFilter({ days, onChange }: DateRangeFilterProps) {
  return (
    <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5">
      {PRESETS.map((preset) => (
        <button
          key={preset.days}
          type="button"
          onClick={() => onChange(preset.days)}
          className={[
            'rounded px-3 py-1.5 text-sm font-medium transition-colors',
            days === preset.days ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50',
          ].join(' ')}
        >
          Last {preset.label}
        </button>
      ))}
    </div>
  )
}
