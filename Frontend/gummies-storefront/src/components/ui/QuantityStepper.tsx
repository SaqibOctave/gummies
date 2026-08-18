import { Minus, Plus } from 'lucide-react'

interface QuantityStepperProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
}

export function QuantityStepper({ value, min = 1, max, onChange }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-300">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex size-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-sm font-medium tabular-nums text-slate-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        disabled={max !== undefined && value >= max}
        className="flex size-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
