import { PoolClient } from 'pg';
import { withTransaction } from '../../config/database';
import { inventoryRepository } from './inventory.repository';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors';
import { variantsRepository } from '../products/variants.repository';

export const inventoryService = {
  async getByVariantId(variantId: string) {
    const inventory = await inventoryRepository.findByVariantId(variantId);
    if (!inventory) throw new NotFoundError('Inventory record not found for variant');
    return inventory;
  },

  async list(page: number, limit: number, lowStockOnly: boolean) {
    const offset = (page - 1) * limit;
    return inventoryRepository.list(limit, offset, lowStockOnly);
  },

  async listMovements(variantId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    return inventoryRepository.listMovements(variantId, limit, offset);
  },

  async restock(variantId: string, quantity: number, note: string | undefined, adminId: string) {
    if (quantity <= 0) throw new BadRequestError('Restock quantity must be positive');

    const variant = await variantsRepository.findById(variantId);
    if (!variant) throw new NotFoundError('Product variant not found');

    return withTransaction(async (client) => {
      const updated = await inventoryRepository.adjustOnHand(client, variantId, quantity);
      await inventoryRepository.recordMovement(client, {
        variantId,
        changeQuantity: quantity,
        reason: 'restock',
        note,
        createdBy: adminId,
      });
      return updated;
    });
  },

  async manualAdjustment(
    variantId: string,
    delta: number,
    note: string | undefined,
    adminId: string
  ) {
    if (delta === 0) throw new BadRequestError('Adjustment quantity cannot be zero');

    const variant = await variantsRepository.findById(variantId);
    if (!variant) throw new NotFoundError('Product variant not found');

    return withTransaction(async (client) => {
      const current = await inventoryRepository.lockByVariantId(client, variantId);
      if (!current) throw new NotFoundError('Inventory record not found for variant');
      if (current.quantity_on_hand + delta < 0) {
        throw new ConflictError('Adjustment would result in negative stock');
      }

      const updated = await inventoryRepository.adjustOnHand(client, variantId, delta);
      await inventoryRepository.recordMovement(client, {
        variantId,
        changeQuantity: delta,
        reason: 'manual_adjustment',
        note,
        createdBy: adminId,
      });
      return updated;
    });
  },

  async setLowStockThreshold(variantId: string, threshold: number) {
    if (threshold < 0) throw new BadRequestError('Threshold cannot be negative');
    return withTransaction(async (client) => {
      const current = await inventoryRepository.lockByVariantId(client, variantId);
      if (!current) throw new NotFoundError('Inventory record not found for variant');
      await inventoryRepository.setLowStockThreshold(client, variantId, threshold);
    });
  },

  // --- Transaction-scoped helpers used by the orders module ---

  async reserveWithClient(
    client: PoolClient,
    variantId: string,
    quantity: number,
    orderId: string
  ): Promise<void> {
    const current = await inventoryRepository.lockByVariantId(client, variantId);
    if (!current) throw new NotFoundError('Inventory record not found for one of the items');

    const available = current.quantity_on_hand - current.quantity_reserved;
    if (available < quantity) {
      throw new ConflictError(`Insufficient stock available for the requested quantity`);
    }

    await inventoryRepository.adjustReserved(client, variantId, quantity);
    await inventoryRepository.recordMovement(client, {
      variantId,
      changeQuantity: quantity,
      reason: 'order_reserved',
      referenceType: 'order',
      referenceId: orderId,
    });
  },

  async releaseWithClient(
    client: PoolClient,
    variantId: string,
    quantity: number,
    orderId: string
  ): Promise<void> {
    await inventoryRepository.adjustReserved(client, variantId, -quantity);
    await inventoryRepository.recordMovement(client, {
      variantId,
      changeQuantity: -quantity,
      reason: 'order_released',
      referenceType: 'order',
      referenceId: orderId,
    });
  },

  async fulfillWithClient(
    client: PoolClient,
    variantId: string,
    quantity: number,
    orderId: string
  ): Promise<void> {
    await inventoryRepository.fulfill(client, variantId, quantity);
    await inventoryRepository.recordMovement(client, {
      variantId,
      changeQuantity: -quantity,
      reason: 'order_fulfilled',
      referenceType: 'order',
      referenceId: orderId,
    });
  },
};
