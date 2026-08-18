interface MultiSelectOption {
  id: string
  label: string
}

interface MultiSelectListProps {
  options: MultiSelectOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  emptyLabel?: string
}

export function MultiSelectList({ options, selectedIds, onChange, emptyLabel }: MultiSelectListProps) {
  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id])
  }

  return (
    <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-slate-300 p-2">
      {options.length === 0 && (
        <p className="px-1 py-1 text-sm text-slate-400">{emptyLabel ?? 'No options available.'}</p>
      )}
      {options.map((option) => (
        <label
          key={option.id}
          className="flex items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-50"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(option.id)}
            onChange={() => toggle(option.id)}
            className="size-4 rounded border-slate-300"
          />
          {option.label}
        </label>
      ))}
    </div>
  )
}
