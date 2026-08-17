import { Router } from 'express';
import { authenticateAdmin, optionalAuthenticateAdmin, requireMinRole } from '../../common/middleware';
import { validate } from '../../common/validation';
import { categoriesController } from './categories.controller';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
  categorySlugParamSchema,
  listCategoriesQuerySchema,
} from './categories.validation';

const router = Router();

router.get(
  '/',
  optionalAuthenticateAdmin,
  validate(listCategoriesQuerySchema, 'query'),
  categoriesController.list
);
router.get('/slug/:slug', validate(categorySlugParamSchema, 'params'), categoriesController.getBySlug);

router.get(
  '/:id',
  authenticateAdmin,
  requireMinRole('staff'),
  validate(categoryIdParamSchema, 'params'),
  categoriesController.getById
);
router.post(
  '/',
  authenticateAdmin,
  requireMinRole('admin'),
  validate(createCategorySchema),
  categoriesController.create
);
router.patch(
  '/:id',
  authenticateAdmin,
  requireMinRole('admin'),
  validate(categoryIdParamSchema, 'params'),
  validate(updateCategorySchema),
  categoriesController.update
);
router.delete(
  '/:id',
  authenticateAdmin,
  requireMinRole('admin'),
  validate(categoryIdParamSchema, 'params'),
  categoriesController.remove
);

export default router;
