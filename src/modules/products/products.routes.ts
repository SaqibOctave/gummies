import { Router } from 'express';
import { authenticateAdmin, optionalAuthenticateAdmin, requireMinRole } from '../../common/middleware';
import { validate } from '../../common/validation';
import { productsController } from './products.controller';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  productSlugParamSchema,
  listProductsQuerySchema,
  createVariantSchema,
  updateVariantSchema,
  variantIdParamSchema,
  attachImageSchema,
  imageIdParamSchema,
} from './products.validation';

const router = Router();

router.get(
  '/',
  optionalAuthenticateAdmin,
  validate(listProductsQuerySchema, 'query'),
  productsController.list
);
router.get('/slug/:slug', validate(productSlugParamSchema, 'params'), productsController.getBySlug);

router.get(
  '/:id',
  authenticateAdmin,
  requireMinRole('staff'),
  validate(productIdParamSchema, 'params'),
  productsController.getById
);
router.post(
  '/',
  authenticateAdmin,
  requireMinRole('admin'),
  validate(createProductSchema),
  productsController.create
);
router.patch(
  '/:id',
  authenticateAdmin,
  requireMinRole('admin'),
  validate(productIdParamSchema, 'params'),
  validate(updateProductSchema),
  productsController.update
);
router.delete(
  '/:id',
  authenticateAdmin,
  requireMinRole('admin'),
  validate(productIdParamSchema, 'params'),
  productsController.remove
);

router.post(
  '/:id/variants',
  authenticateAdmin,
  requireMinRole('admin'),
  validate(productIdParamSchema, 'params'),
  validate(createVariantSchema),
  productsController.addVariant
);
router.patch(
  '/:id/variants/:variantId',
  authenticateAdmin,
  requireMinRole('admin'),
  validate(productIdParamSchema, 'params'),
  validate(variantIdParamSchema, 'params'),
  validate(updateVariantSchema),
  productsController.updateVariant
);
router.delete(
  '/:id/variants/:variantId',
  authenticateAdmin,
  requireMinRole('admin'),
  validate(productIdParamSchema, 'params'),
  validate(variantIdParamSchema, 'params'),
  productsController.removeVariant
);

router.post(
  '/:id/images',
  authenticateAdmin,
  requireMinRole('admin'),
  validate(productIdParamSchema, 'params'),
  validate(attachImageSchema),
  productsController.attachImage
);
router.put(
  '/:id/images/:imageId/primary',
  authenticateAdmin,
  requireMinRole('admin'),
  validate(productIdParamSchema, 'params'),
  validate(imageIdParamSchema, 'params'),
  productsController.setPrimaryImage
);
router.delete(
  '/:id/images/:imageId',
  authenticateAdmin,
  requireMinRole('admin'),
  validate(productIdParamSchema, 'params'),
  validate(imageIdParamSchema, 'params'),
  productsController.removeImage
);

export default router;
