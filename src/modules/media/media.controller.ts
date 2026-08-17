import { Request, Response } from 'express';
import { asyncHandler, sendCreated, sendSuccess, sendNoContent } from '../../common/utils';
import { parsePagination, buildPaginationMeta } from '../../common/types/pagination';
import { BadRequestError } from '../../common/errors';
import { mediaService } from './media.service';
import { auditLogService } from '../audit/audit.service';

export const mediaController = {
  upload: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new BadRequestError('No file uploaded');
    const media = await mediaService.upload(req.file, req.body.altText, req.admin!.id);

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'media.upload',
      entityType: 'media',
      entityId: media.id,
      afterData: media,
      req,
    });

    sendCreated(res, media);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const media = await mediaService.getById((req.params.id as string));
    sendSuccess(res, media);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const { items, total } = await mediaService.list(page, limit);
    sendSuccess(res, items, 200, buildPaginationMeta(page, limit, total));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await mediaService.remove((req.params.id as string));

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'media.delete',
      entityType: 'media',
      entityId: (req.params.id as string),
      req,
    });

    sendNoContent(res);
  }),
};
