import { Router } from 'express';
import { authenticateAdmin, requireMinRole } from '../../common/middleware';
import { validate } from '../../common/validation';
import { customersController } from './customers.controller';
import { listCustomersQuerySchema, customerIdParamSchema } from './customers.validation';

const router = Router();

router.use(authenticateAdmin, requireMinRole('staff'));

router.get('/', validate(listCustomersQuerySchema, 'query'), customersController.list);
router.get('/:id', validate(customerIdParamSchema, 'params'), customersController.getById);
router.get(
  '/:id/orders',
  validate(customerIdParamSchema, 'params'),
  customersController.orderHistory
);

export default router;
