import { useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useSettingsQuery } from '@/hooks/useSettings'
import { SettingsForm } from '@/components/settings/SettingsForm'
import { OtherSettingsPanel } from '@/components/settings/OtherSettingsPanel'
import { KNOWN_SETTINGS } from '@/types/setting'

export function Settings() {
  const { admin: currentAdmin } = useAuth()
  const canEdit = currentAdmin?.role === 'super_admin' || currentAdmin?.role === 'admin'

  const { data, isLoading, isError, isFetching, refetch } = useSettingsQuery()

  const otherEntries = useMemo(() => {
    if (!data) return []
    const knownKeys = new Set(KNOWN_SETTINGS.map((f) => f.key))
    return Object.entries(data).filter(([key]) => !knownKeys.has(key))
  }, [data])

  return (
    <div className="px-6 py-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Store-wide configuration used across checkout and the storefront.</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          title="Refresh"
          className="flex size-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50"
        >
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {!canEdit && (
        <p className="mt-4 text-sm text-slate-500">
          You have read-only access to settings. Only Admins and Super Admins can make changes.
        </p>
      )}

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Failed to load settings.</p>
        ) : (
          data && (
            <>
              <SettingsForm data={data} canEdit={canEdit} />
              <OtherSettingsPanel entries={otherEntries} canEdit={canEdit} />
            </>
          )
        )}
      </div>
    </div>
  )
}
