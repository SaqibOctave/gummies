import { Router } from 'express';
import { authenticateAdmin, requireMinRole } from '../../common/middleware';
import { validate } from '../../common/validation';
import { settingsController } from './settings.controller';
import { settingKeyParamSchema } from './settings.validation';

const router = Router();

router.get('/public', settingsController.getPublic);

router.use(authenticateAdmin);
router.get('/', requireMinRole('staff'), settingsController.list);
router.put(
  '/:key',
  requireMinRole('admin'),
  validate(settingKeyParamSchema, 'params'),
  settingsController.update
);

export default router;
