import { Schema } from '../../common/validation';

export const listAuditLogsQuerySchema: Schema = {
  page: { type: 'integer', required: false, min: 1 },
  limit: { type: 'integer', required: false, min: 1, max: 100 },
  entityType: { type: 'string', required: false },
  entityId: { type: 'string', required: false },
  adminId: { type: 'uuid', required: false },
  action: { type: 'string', required: false },
};
