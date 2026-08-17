import { Request } from 'express';
import { auditRepository, AuditLogFilter } from './audit.repository';
import { logger } from '../../common/utils/logger';

interface RecordAuditInput {
  adminId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  beforeData?: unknown;
  afterData?: unknown;
  req?: Request;
}

export const auditLogService = {
  // Audit logging must never fail the primary business operation, so any
  // write error here is logged and swallowed rather than propagated.
  async record(input: RecordAuditInput): Promise<void> {
    try {
      await auditRepository.insert({
        adminId: input.adminId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        beforeData: input.beforeData,
        afterData: input.afterData,
        ipAddress: input.req?.ip ?? null,
        userAgent: input.req?.headers['user-agent'] ?? null,
      });
    } catch (error) {
      logger.error('Failed to write audit log', {
        action: input.action,
        entityType: input.entityType,
        error: (error as Error).message,
      });
    }
  },

  async list(filter: AuditLogFilter, page: number, limit: number) {
    const offset = (page - 1) * limit;
    return auditRepository.list(filter, limit, offset);
  },
};
