import { query } from '../../config/database';
import { AuditLogRecord } from './audit.types';

export interface InsertAuditLogInput {
  adminId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  beforeData?: unknown;
  afterData?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuditLogFilter {
  entityType?: string;
  entityId?: string;
  adminId?: string;
  action?: string;
}

export const auditRepository = {
  async insert(input: InsertAuditLogInput): Promise<void> {
    await query(
      `INSERT INTO audit_logs
        (admin_id, action, entity_type, entity_id, before_data, after_data, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        input.adminId,
        input.action,
        input.entityType,
        input.entityId,
        input.beforeData ? JSON.stringify(input.beforeData) : null,
        input.afterData ? JSON.stringify(input.afterData) : null,
        input.ipAddress ?? null,
        input.userAgent ?? null,
      ]
    );
  },

  async list(
    filter: AuditLogFilter,
    limit: number,
    offset: number
  ): Promise<{ items: AuditLogRecord[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filter.entityType) {
      params.push(filter.entityType);
      conditions.push(`entity_type = $${params.length}`);
    }
    if (filter.entityId) {
      params.push(filter.entityId);
      conditions.push(`entity_id = $${params.length}`);
    }
    if (filter.adminId) {
      params.push(filter.adminId);
      conditions.push(`admin_id = $${params.length}`);
    }
    if (filter.action) {
      params.push(filter.action);
      conditions.push(`action = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const items = await query<AuditLogRecord>(
      `SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${
        params.length + 2
      }`,
      [...params, limit, offset]
    );
    const count = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM audit_logs ${where}`,
      params
    );

    return { items: items.rows, total: Number(count.rows[0].count) };
  },
};
