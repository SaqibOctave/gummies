import { Request, Response } from 'express';
import { asyncHandler, sendCreated, sendSuccess, sendNoContent } from '../../common/utils';
import { parsePagination, buildPaginationMeta } from '../../common/types/pagination';
import { productsService } from './products.service';
import { auditLogService } from '../audit/audit.service';

export const productsController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.create(req.body);

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'product.create',
      entityType: 'product',
      entityId: product.id,
      afterData: product,
      req,
    });

    sendCreated(res, product);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const activeOnly = !req.admin;
    const { categoryId, search } = req.query as Record<string, string>;
    const { items, total } = await productsService.list(
      { categoryId, search, activeOnly },
      page,
      limit
    );
    sendSuccess(res, items, 200, buildPaginationMeta(page, limit, total));
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.getDetailBySlug((req.params.slug as string));
    sendSuccess(res, product);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.getAdminDetail((req.params.id as string));
    sendSuccess(res, product);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.update((req.params.id as string), req.body);

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'product.update',
      entityType: 'product',
      entityId: product.id,
      afterData: product,
      req,
    });

    sendSuccess(res, product);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await productsService.remove((req.params.id as string));

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'product.delete',
      entityType: 'product',
      entityId: (req.params.id as string),
      req,
    });

    sendNoContent(res);
  }),

  addVariant: asyncHandler(async (req: Request, res: Response) => {
    const variant = await productsService.addVariant((req.params.id as string), req.body);

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'product.variant.create',
      entityType: 'product_variant',
      entityId: variant.id,
      afterData: variant,
      req,
    });

    sendCreated(res, variant);
  }),

  updateVariant: asyncHandler(async (req: Request, res: Response) => {
    const variant = await productsService.updateVariant((req.params.variantId as string), req.body);

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'product.variant.update',
      entityType: 'product_variant',
      entityId: variant.id,
      afterData: variant,
      req,
    });

    sendSuccess(res, variant);
  }),

  removeVariant: asyncHandler(async (req: Request, res: Response) => {
    await productsService.removeVariant((req.params.variantId as string));

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'product.variant.delete',
      entityType: 'product_variant',
      entityId: (req.params.variantId as string),
      req,
    });

    sendNoContent(res);
  }),

  attachImage: asyncHandler(async (req: Request, res: Response) => {
    const image = await productsService.attachImage(
      (req.params.id as string),
      req.body.mediaId,
      Boolean(req.body.isPrimary),
      req.body.sortOrder ?? 0
    );
    sendCreated(res, image);
  }),

  setPrimaryImage: asyncHandler(async (req: Request, res: Response) => {
    await productsService.setPrimaryImage((req.params.id as string), (req.params.imageId as string));
    sendSuccess(res, { imageId: (req.params.imageId as string), isPrimary: true });
  }),

  removeImage: asyncHandler(async (req: Request, res: Response) => {
    await productsService.removeImage((req.params.id as string), (req.params.imageId as string));
    sendNoContent(res);
  }),
};
