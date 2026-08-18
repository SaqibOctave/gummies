import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useUpdateSettingMutation } from '@/hooks/useSettings'
import { ApiError } from '@/api/httpClient'
import { KNOWN_SETTINGS } from '@/types/setting'
import type { SettingsMap } from '@/types/setting'

const settingsFormSchema = z.object({
  store_name: z.string().min(1, 'Required').max(200),
  store_currency: z
    .string()
    .min(3, 'Use a 3-letter currency code')
    .max(3, 'Use a 3-letter currency code')
    .toUpperCase(),
  flat_shipping_rate: z.number().min(0, 'Must be 0 or more'),
  free_shipping_threshold: z.number().min(0, 'Must be 0 or more'),
  tax_rate_percent: z.number().min(0, 'Must be 0 or more').max(100, 'Must be 100 or less'),
  contact_email: z.email('Enter a valid email'),
})

type SettingsFormValues = z.infer<typeof settingsFormSchema>

function toFormValues(data: SettingsMap): SettingsFormValues {
  return {
    store_name: typeof data.store_name === 'string' ? data.store_name : '',
    store_currency: typeof data.store_currency === 'string' ? data.store_currency : '',
    flat_shipping_rate: Number(data.flat_shipping_rate ?? 0),
    free_shipping_threshold: Number(data.free_shipping_threshold ?? 0),
    tax_rate_percent: Number(data.tax_rate_percent ?? 0),
    contact_email: typeof data.contact_email === 'string' ? data.contact_email : '',
  }
}

interface SettingsFormProps {
  data: SettingsMap
  canEdit: boolean
}

export function SettingsForm({ data, canEdit }: SettingsFormProps) {
  const updateMutation = useUpdateSettingMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    values: toFormValues(data),
  })

  const onSubmit = handleSubmit(async (values) => {
    const original = toFormValues(data)
    const changedKeys = (Object.keys(values) as (keyof SettingsFormValues)[]).filter(
      (key) => values[key] !== original[key]
    )

    if (changedKeys.length === 0) {
      toast.info('Nothing to save')
      return
    }

    try {
      await Promise.all(changedKeys.map((key) => updateMutation.mutateAsync({ key, value: values[key] })))
      toast.success('Settings saved')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save settings')
    }
  })

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      {KNOWN_SETTINGS.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-slate-700">{field.label}</label>
          <input
            type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
            step={field.type === 'number' ? 'any' : undefined}
            disabled={!canEdit}
            {...register(
              field.key as keyof SettingsFormValues,
              field.type === 'number' ? { valueAsNumber: true } : {}
            )}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          />
          {field.description && <p className="mt-1 text-xs text-slate-500">{field.description}</p>}
          {errors[field.key as keyof SettingsFormValues] && (
            <p className="mt-1 text-xs text-red-600">
              {errors[field.key as keyof SettingsFormValues]?.message}
            </p>
          )}
        </div>
      ))}

      {canEdit && (
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={updateMutation.isPending || !isDirty}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      )}
    </form>
  )
}
