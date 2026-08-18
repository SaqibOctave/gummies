import { httpClient } from './httpClient'
import type { PublicSettings } from '@/types/setting'

export function getPublicSettings(): Promise<PublicSettings> {
  return httpClient.get<PublicSettings>('/settings/public')
}
