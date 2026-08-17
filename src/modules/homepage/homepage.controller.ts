import { Request, Response } from 'express';
import { asyncHandler, sendCreated, sendSuccess, sendNoContent } from '../../common/utils';
import { homepageService } from './homepage.service';
import { auditLogService } from '../audit/audit.service';

export const homepageController = {
  getPublic: asyncHandler(async (_req: Request, res: Response) => {
    const blocks = await homepageService.getPublicBlocks();
    sendSuccess(res, blocks);
  }),

  list: asyncHandler(async (_req: Request, res: Response) => {
    const blocks = await homepageService.listAll();
    sendSuccess(res, blocks);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const block = await homepageService.getById((req.params.id as string));
    sendSuccess(res, block);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const block = await homepageService.create(req.body);

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'homepage_block.create',
      entityType: 'homepage_block',
      entityId: block.id,
      afterData: block,
      req,
    });

    sendCreated(res, block);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const block = await homepageService.update((req.params.id as string), req.body);

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'homepage_block.update',
      entityType: 'homepage_block',
      entityId: block.id,
      afterData: block,
      req,
    });

    sendSuccess(res, block);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await homepageService.remove((req.params.id as string));

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'homepage_block.delete',
      entityType: 'homepage_block',
      entityId: (req.params.id as string),
      req,
    });

    sendNoContent(res);
  }),
};
