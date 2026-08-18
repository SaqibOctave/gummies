import { httpClient } from './httpClient'
import type { PaginatedResult } from '@/types/pagination'
import type { AuditLog, AuditLogFilters } from '@/types/auditLog'

function toQueryString(params: object): string {
  const usp = new URLSearchParams()
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined && value !== '') usp.set(key, String(value))
  }
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}

export function list(params: AuditLogFilters = {}): Promise<PaginatedResult<AuditLog>> {
  return httpClient.getPaginated<AuditLog>(`/audit-logs${toQueryString(params)}`)
}
