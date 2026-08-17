import { Request, Response } from 'express';
import { asyncHandler, sendCreated, sendSuccess, sendNoContent } from '../../common/utils';
import { categoriesService } from './categories.service';
import { auditLogService } from '../audit/audit.service';

export const categoriesController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoriesService.create(req.body);

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'category.create',
      entityType: 'category',
      entityId: category.id,
      afterData: category,
      req,
    });

    sendCreated(res, category);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const activeOnly = !req.admin || req.query.activeOnly === 'true';
    const categories = await categoriesService.list(activeOnly);
    sendSuccess(res, categories);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoriesService.getById((req.params.id as string));
    sendSuccess(res, category);
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoriesService.getBySlug((req.params.slug as string));
    sendSuccess(res, category);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoriesService.update((req.params.id as string), req.body);

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'category.update',
      entityType: 'category',
      entityId: category.id,
      afterData: category,
      req,
    });

    sendSuccess(res, category);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await categoriesService.remove((req.params.id as string));

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'category.delete',
      entityType: 'category',
      entityId: (req.params.id as string),
      req,
    });

    sendNoContent(res);
  }),
};
