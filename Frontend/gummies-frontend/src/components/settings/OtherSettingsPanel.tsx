import { useState } from 'react'
import { toast } from 'sonner'
import { useUpdateSettingMutation } from '@/hooks/useSettings'
import { ApiError } from '@/api/httpClient'

interface OtherSettingRowProps {
  settingKey: string
  value: unknown
  canEdit: boolean
}

// Fallback editor for any settings key the app doesn't ship a typed field
// for - keeps the page honest about what's actually in the table instead of
// silently hiding rows KNOWN_SETTINGS doesn't know about.
function OtherSettingRow({ settingKey, value, canEdit }: OtherSettingRowProps) {
  const [raw, setRaw] = useState(JSON.stringify(value, null, 2))
  const updateMutation = useUpdateSettingMutation()

  async function handleSave() {
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      toast.error('Value must be valid JSON')
      return
    }
    try {
      await updateMutation.mutateAsync({ key: settingKey, value: parsed })
      toast.success(`"${settingKey}" saved`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save')
    }
  }

  return (
    <div className="border-t border-slate-100 py-3 first:border-t-0">
      <label className="block text-sm font-medium text-slate-700">{settingKey}</label>
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        disabled={!canEdit}
        rows={2}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      />
      {canEdit && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}

interface OtherSettingsPanelProps {
  entries: [string, unknown][]
  canEdit: boolean
}

export function OtherSettingsPanel({ entries, canEdit }: OtherSettingsPanelProps) {
  if (entries.length === 0) return null

  return (
    <div className="mt-6 max-w-xl rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">Other settings</h3>
      <p className="mt-1 text-xs text-slate-500">
        Keys stored in the settings table that don't have a dedicated field above. Values are raw JSON.
      </p>
      <div className="mt-3">
        {entries.map(([key, value]) => (
          <OtherSettingRow key={key} settingKey={key} value={value} canEdit={canEdit} />
        ))}
      </div>
    </div>
  )
}
