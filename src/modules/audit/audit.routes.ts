import { Router } from 'express';
import { authenticateAdmin, requireMinRole } from '../../common/middleware';
import { validate } from '../../common/validation';
import { auditController } from './audit.controller';
import { listAuditLogsQuerySchema } from './audit.validation';

const router = Router();

router.use(authenticateAdmin, requireMinRole('admin'));
router.get('/', validate(listAuditLogsQuerySchema, 'query'), auditController.list);

export default router;
