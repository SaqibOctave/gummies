import { Router } from 'express';
import { authenticateAdmin, requireMinRole } from '../../common/middleware';
import { validate } from '../../common/validation';
import { adminsController } from './admins.controller';
import {
  createAdminSchema,
  updateAdminSchema,
  adminIdParamSchema,
  listAdminsQuerySchema,
} from './admins.validation';

const router = Router();

router.use(authenticateAdmin);

router.get('/', requireMinRole('admin'), validate(listAdminsQuerySchema, 'query'), adminsController.list);
router.get('/:id', requireMinRole('admin'), validate(adminIdParamSchema, 'params'), adminsController.getById);
router.post('/', requireMinRole('super_admin'), validate(createAdminSchema), adminsController.create);
router.patch(
  '/:id',
  requireMinRole('super_admin'),
  validate(adminIdParamSchema, 'params'),
  validate(updateAdminSchema),
  adminsController.update
);

export default router;
