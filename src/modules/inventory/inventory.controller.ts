import { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../common/utils';
import { parsePagination, buildPaginationMeta } from '../../common/types/pagination';
import { inventoryService } from './inventory.service';
import { auditLogService } from '../audit/audit.service';

export const inventoryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const lowStockOnly = req.query.lowStockOnly === 'true';
    const { items, total } = await inventoryService.list(page, limit, lowStockOnly);
    sendSuccess(res, items, 200, buildPaginationMeta(page, limit, total));
  }),

  getByVariant: asyncHandler(async (req: Request, res: Response) => {
    const inventory = await inventoryService.getByVariantId((req.params.variantId as string));
    sendSuccess(res, inventory);
  }),

  listMovements: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const movements = await inventoryService.listMovements((req.params.variantId as string), page, limit);
    sendSuccess(res, movements);
  }),

  restock: asyncHandler(async (req: Request, res: Response) => {
    const inventory = await inventoryService.restock(
      (req.params.variantId as string),
      req.body.quantity,
      req.body.note,
      req.admin!.id
    );

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'inventory.restock',
      entityType: 'inventory',
      entityId: (req.params.variantId as string),
      afterData: inventory,
      req,
    });

    sendSuccess(res, inventory);
  }),

  adjust: asyncHandler(async (req: Request, res: Response) => {
    const inventory = await inventoryService.manualAdjustment(
      (req.params.variantId as string),
      req.body.delta,
      req.body.note,
      req.admin!.id
    );

    await auditLogService.record({
      adminId: req.admin!.id,
      action: 'inventory.adjust',
      entityType: 'inventory',
      entityId: (req.params.variantId as string),
      afterData: inventory,
      req,
    });

    sendSuccess(res, inventory);
  }),

  setThreshold: asyncHandler(async (req: Request, res: Response) => {
    await inventoryService.setLowStockThreshold((req.params.variantId as string), req.body.threshold);
    sendSuccess(res, { variantId: (req.params.variantId as string), threshold: req.body.threshold });
  }),
};
