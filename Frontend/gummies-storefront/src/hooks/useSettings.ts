import { useQuery } from '@tanstack/react-query'
import * as settingsApi from '@/api/settings'

export function usePublicSettingsQuery() {
  return useQuery({
    queryKey: ['settings', 'public'],
    queryFn: settingsApi.getPublicSettings,
    staleTime: 5 * 60_000,
  })
}
