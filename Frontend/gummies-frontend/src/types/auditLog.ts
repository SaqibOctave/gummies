export interface AuditLog {
  id: string
  admin_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  before_data: unknown
  after_data: unknown
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface AuditLogFilters {
  page?: number
  limit?: number
  entityType?: string
  entityId?: string
  adminId?: string
  action?: string
}
