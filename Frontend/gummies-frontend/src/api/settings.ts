import { httpClient } from './httpClient'
import type { SettingsMap } from '@/types/setting'

export interface SettingRecord {
  key: string
  value: unknown
  updated_at: string
  updated_by: string | null
}

export function list(): Promise<SettingsMap> {
  return httpClient.get<SettingsMap>('/settings')
}

export function update(key: string, value: unknown): Promise<SettingRecord> {
  return httpClient.put<SettingRecord>(`/settings/${encodeURIComponent(key)}`, { value })
}
