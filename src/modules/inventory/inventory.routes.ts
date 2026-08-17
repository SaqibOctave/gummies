import { Router } from 'express';
import { authenticateAdmin, requireMinRole } from '../../common/middleware';
import { validate } from '../../common/validation';
import { inventoryController } from './inventory.controller';
import {
  restockSchema,
  adjustSchema,
  thresholdSchema,
  variantIdParamSchema,
  listInventoryQuerySchema,
} from './inventory.validation';

const router = Router();

router.use(authenticateAdmin, requireMinRole('staff'));

router.get('/', validate(listInventoryQuerySchema, 'query'), inventoryController.list);
router.get(
  '/:variantId',
  validate(variantIdParamSchema, 'params'),
  inventoryController.getByVariant
);
router.get(
  '/:variantId/movements',
  validate(variantIdParamSchema, 'params'),
  inventoryController.listMovements
);
router.post(
  '/:variantId/restock',
  requireMinRole('admin'),
  validate(variantIdParamSchema, 'params'),
  validate(restockSchema),
  inventoryController.restock
);
router.post(
  '/:variantId/adjust',
  requireMinRole('admin'),
  validate(variantIdParamSchema, 'params'),
  validate(adjustSchema),
  inventoryController.adjust
);
router.put(
  '/:variantId/threshold',
  requireMinRole('admin'),
  validate(variantIdParamSchema, 'params'),
  validate(thresholdSchema),
  inventoryController.setThreshold
);

export default router;
