import { Router } from 'express';
import { authenticateAdmin, requireMinRole } from '../../common/middleware';
import { validate } from '../../common/validation';
import { reportsController } from './reports.controller';
import { dateRangeQuerySchema, topProductsQuerySchema } from './reports.validation';

const router = Router();

router.use(authenticateAdmin, requireMinRole('staff'));

router.get('/dashboard', reportsController.dashboard);
router.get('/sales', validate(dateRangeQuerySchema, 'query'), reportsController.sales);
router.get(
  '/revenue-over-time',
  validate(dateRangeQuerySchema, 'query'),
  reportsController.revenueOverTime
);
router.get(
  '/top-products',
  validate(topProductsQuerySchema, 'query'),
  reportsController.topProducts
);

export default router;
