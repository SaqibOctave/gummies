import { useQuery } from '@tanstack/react-query'
import * as auditLogsApi from '@/api/auditLogs'
import type { AuditLogFilters } from '@/types/auditLog'

export function useAuditLogsQuery(params: AuditLogFilters) {
  return useQuery({
    queryKey: ['audit-logs', 'list', params],
    queryFn: () => auditLogsApi.list(params),
    placeholderData: (prev) => prev,
  })
}
