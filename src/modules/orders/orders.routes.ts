import { Router } from 'express';
import { authenticateAdmin, requireMinRole, rateLimiter } from '../../common/middleware';
import { validate } from '../../common/validation';
import { ordersController } from './orders.controller';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderIdParamSchema,
  listOrdersQuerySchema,
  lookupOrderQuerySchema,
} from './orders.validation';
import { env } from '../../config/env';

const router = Router();

const checkoutRateLimiter = rateLimiter({
  windowMs: env.rateLimit.windowMs,
  max: 20,
  keyPrefix: 'checkout',
  message: 'Too many checkout attempts. Please try again later.',
});

// Guest checkout
router.post('/', checkoutRateLimiter, validate(createOrderSchema), ordersController.create);

// Guest order lookup by order number + email
router.get(
  '/lookup/:orderNumber',
  validate(lookupOrderQuerySchema, 'query'),
  ordersController.lookup
);

// Admin order management
router.get(
  '/',
  authenticateAdmin,
  requireMinRole('staff'),
  validate(listOrdersQuerySchema, 'query'),
  ordersController.list
);
router.get(
  '/:id',
  authenticateAdmin,
  requireMinRole('staff'),
  validate(orderIdParamSchema, 'params'),
  ordersController.getById
);
router.patch(
  '/:id/status',
  authenticateAdmin,
  requireMinRole('admin'),
  validate(orderIdParamSchema, 'params'),
  validate(updateOrderStatusSchema),
  ordersController.updateStatus
);

export default router;
