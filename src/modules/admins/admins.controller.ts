import { Request, Response } from 'express';
import { asyncHandler, sendCreated, sendSuccess } from '../../common/utils';
import { parsePagination, buildPaginationMeta } from '../../common/types/pagination';
import { adminsService } from './admins.service';
import { auditLogService } from '../audit/audit.service';

export const adminsController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const admin = await adminsService.create(req.body);

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'admin.create',
      entityType: 'admin',
      entityId: admin.id,
      afterData: admin,
      req,
    });

    sendCreated(res, admin);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const admin = await adminsService.getById((req.params.id as string));
    sendSuccess(res, admin);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const { items, total } = await adminsService.list(page, limit);
    sendSuccess(res, items, 200, buildPaginationMeta(page, limit, total));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const admin = await adminsService.update((req.params.id as string), req.admin!.id, req.body);

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'admin.update',
      entityType: 'admin',
      entityId: admin.id,
      afterData: admin,
      req,
    });

    sendSuccess(res, admin);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const admin = await adminsService.getById(req.admin!.id);
    sendSuccess(res, admin);
  }),
};
