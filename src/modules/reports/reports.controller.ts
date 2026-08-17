import { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../common/utils';
import { reportsService } from './reports.service';

export const reportsController = {
  dashboard: asyncHandler(async (_req: Request, res: Response) => {
    const data = await reportsService.dashboard();
    sendSuccess(res, data);
  }),

  sales: asyncHandler(async (req: Request, res: Response) => {
    const { dateFrom, dateTo } = req.query as Record<string, string>;
    const data = await reportsService.salesReport(dateFrom, dateTo);
    sendSuccess(res, data);
  }),

  revenueOverTime: asyncHandler(async (req: Request, res: Response) => {
    const { dateFrom, dateTo } = req.query as Record<string, string>;
    const data = await reportsService.revenueOverTime(dateFrom, dateTo);
    sendSuccess(res, data);
  }),

  topProducts: asyncHandler(async (req: Request, res: Response) => {
    const { dateFrom, dateTo, limit } = req.query as Record<string, string>;
    const data = await reportsService.topProducts(Number(limit) || 10, dateFrom, dateTo);
    sendSuccess(res, data);
  }),
};
