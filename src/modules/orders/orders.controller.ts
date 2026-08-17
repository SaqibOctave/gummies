import { Request, Response } from 'express';
import { asyncHandler, sendCreated, sendSuccess } from '../../common/utils';
import { parsePagination, buildPaginationMeta } from '../../common/types/pagination';
import { ordersService } from './orders.service';
import { assertValidAddress, assertValidItems } from './orders.validation';
import { auditLogService } from '../audit/audit.service';

export const ordersController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    assertValidAddress(req.body.shippingAddress, 'shippingAddress');
    if (req.body.billingAddress) assertValidAddress(req.body.billingAddress, 'billingAddress');
    assertValidItems(req.body.items);

    const result = await ordersService.createOrder(req.body);
    sendCreated(res, result);
  }),

  lookup: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.getByOrderNumber(
      (req.params.orderNumber as string),
      req.query.email as string
    );
    sendSuccess(res, order);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.getById((req.params.id as string));
    sendSuccess(res, order);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const { status, search } = req.query as Record<string, string>;
    const { items, total } = await ordersService.list(
      { status: status as never, search },
      page,
      limit
    );
    sendSuccess(res, items, 200, buildPaginationMeta(page, limit, total));
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.updateStatus(
      (req.params.id as string),
      req.body.status,
      req.body.note,
      req.admin!.id
    );

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'order.update_status',
      entityType: 'order',
      entityId: order.id,
      afterData: { status: order.status },
      req,
    });

    sendSuccess(res, order);
  }),
};
