import { PoolClient } from 'pg';
import { query } from '../../config/database';
import {
  InventoryRecord,
  InventoryWithProductInfo,
  InventoryMovementReason,
} from './inventory.types';

export const inventoryRepository = {
  // --- Read paths (pool-level, no transactional requirement) ---

  async findByVariantId(variantId: string): Promise<InventoryRecord | null> {
    const result = await query<InventoryRecord>(
      'SELECT * FROM inventory WHERE variant_id = $1',
      [variantId]
    );
    return result.rows[0] ?? null;
  },

  async list(
    limit: number,
    offset: number,
    lowStockOnly: boolean
  ): Promise<{ items: InventoryWithProductInfo[]; total: number }> {
    const where = lowStockOnly
      ? 'WHERE (i.quantity_on_hand - i.quantity_reserved) <= i.low_stock_threshold'
      : '';

    const items = await query<InventoryWithProductInfo>(
      `SELECT i.*, v.sku, v.name AS variant_name, p.id AS product_id, p.name AS product_name
       FROM inventory i
       JOIN product_variants v ON v.id = i.variant_id
       JOIN products p ON p.id = v.product_id
       ${where}
       ORDER BY p.name ASC, v.name ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const count = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM inventory i
       ${where}`
    );
    return { items: items.rows, total: Number(count.rows[0].count) };
  },

  async listMovements(variantId: string, limit: number, offset: number) {
    const result = await query(
      `SELECT * FROM inventory_movements WHERE variant_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [variantId, limit, offset]
    );
    return result.rows;
  },

  // --- Write paths (transaction-scoped; caller supplies the client) ---

  async createForVariant(
    client: PoolClient,
    variantId: string,
    initialQuantity = 0,
    lowStockThreshold = 10
  ): Promise<InventoryRecord> {
    const result = await client.query<InventoryRecord>(
      `INSERT INTO inventory (variant_id, quantity_on_hand, low_stock_threshold)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [variantId, initialQuantity, lowStockThreshold]
    );
    return result.rows[0];
  },

  async lockByVariantId(client: PoolClient, variantId: string): Promise<InventoryRecord | null> {
    const result = await client.query<InventoryRecord>(
      'SELECT * FROM inventory WHERE variant_id = $1 FOR UPDATE',
      [variantId]
    );
    return result.rows[0] ?? null;
  },

  async adjustOnHand(client: PoolClient, variantId: string, delta: number): Promise<InventoryRecord> {
    const result = await client.query<InventoryRecord>(
      `UPDATE inventory
       SET quantity_on_hand = quantity_on_hand + $2
       WHERE variant_id = $1
       RETURNING *`,
      [variantId, delta]
    );
    return result.rows[0];
  },

  async adjustReserved(client: PoolClient, variantId: string, delta: number): Promise<InventoryRecord> {
    const result = await client.query<InventoryRecord>(
      `UPDATE inventory
       SET quantity_reserved = quantity_reserved + $2
       WHERE variant_id = $1
       RETURNING *`,
      [variantId, delta]
    );
    return result.rows[0];
  },

  async fulfill(client: PoolClient, variantId: string, quantity: number): Promise<InventoryRecord> {
    const result = await client.query<InventoryRecord>(
      `UPDATE inventory
       SET quantity_on_hand = quantity_on_hand - $2,
           quantity_reserved = quantity_reserved - $2
       WHERE variant_id = $1
       RETURNING *`,
      [variantId, quantity]
    );
    return result.rows[0];
  },

  async setLowStockThreshold(client: PoolClient, variantId: string, threshold: number): Promise<void> {
    await client.query('UPDATE inventory SET low_stock_threshold = $2 WHERE variant_id = $1', [
      variantId,
      threshold,
    ]);
  },

  async recordMovement(
    client: PoolClient,
    input: {
      variantId: string;
      changeQuantity: number;
      reason: InventoryMovementReason;
      referenceType?: string | null;
      referenceId?: string | null;
      note?: string | null;
      createdBy?: string | null;
    }
  ): Promise<void> {
    await client.query(
      `INSERT INTO inventory_movements
        (variant_id, change_quantity, reason, reference_type, reference_id, note, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        input.variantId,
        input.changeQuantity,
        input.reason,
        input.referenceType ?? null,
        input.referenceId ?? null,
        input.note ?? null,
        input.createdBy ?? null,
      ]
    );
  },
};
