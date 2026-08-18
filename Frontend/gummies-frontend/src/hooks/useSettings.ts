import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as settingsApi from '@/api/settings'

const SETTINGS_KEY = ['settings'] as const

export function useSettingsQuery() {
  return useQuery({ queryKey: SETTINGS_KEY, queryFn: settingsApi.list })
}

export function useUpdateSettingMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) => settingsApi.update(key, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEY }),
  })
}
