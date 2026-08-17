import { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../common/utils';
import { BadRequestError } from '../../common/errors';
import { settingsService } from './settings.service';
import { auditLogService } from '../audit/audit.service';

export const settingsController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingsService.list();
    sendSuccess(res, settings);
  }),

  getPublic: asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingsService.getPublic();
    sendSuccess(res, settings);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!('value' in req.body)) throw new BadRequestError('"value" is required');

    const updated = await settingsService.set((req.params.key as string), req.body.value, req.admin!.id);

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'settings.update',
      entityType: 'setting',
      entityId: (req.params.key as string),
      afterData: updated,
      req,
    });

    sendSuccess(res, updated);
  }),
};
