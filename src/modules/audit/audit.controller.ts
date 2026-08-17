import { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../common/utils';
import { parsePagination, buildPaginationMeta } from '../../common/types/pagination';
import { auditLogService } from './audit.service';

export const auditController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const { entityType, entityId, adminId, action } = req.query as Record<string, string>;
    const { items, total } = await auditLogService.list(
      { entityType, entityId, adminId, action },
      page,
      limit
    );
    sendSuccess(res, items, 200, buildPaginationMeta(page, limit, total));
  }),
};
