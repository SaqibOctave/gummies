import { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../common/utils';
import { parsePagination, buildPaginationMeta } from '../../common/types/pagination';
import { customersService } from './customers.service';

export const customersController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const { search } = req.query as Record<string, string>;
    const { items, total } = await customersService.list(search, page, limit);
    sendSuccess(res, items, 200, buildPaginationMeta(page, limit, total));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const customer = await customersService.getById((req.params.id as string));
    sendSuccess(res, customer);
  }),

  orderHistory: asyncHandler(async (req: Request, res: Response) => {
    const orders = await customersService.getOrderHistory((req.params.id as string));
    sendSuccess(res, orders);
  }),
};
