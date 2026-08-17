import { PoolClient } from 'pg';
import { query } from '../../config/database';
import { OrderRecord, OrderItemRecord, OrderStatusHistoryRecord, Address } from './orders.types';
import { OrderStatus } from '../../common/constants/orderStatus';

export interface InsertOrderInput {
  orderNumber: string;
  customerId: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  shippingAddress: Address;
  billingAddress?: Address | null;
  currency: string;
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  customerNotes?: string | null;
}

export interface InsertOrderItemInput {
  orderId: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderListFilter {
  status?: OrderStatus;
  search?: string;
  customerId?: string;
}

export const ordersRepository = {
  async insertOrder(client: PoolClient, input: InsertOrderInput): Promise<OrderRecord> {
    const result = await client.query<OrderRecord>(
      `INSERT INTO orders
        (order_number, customer_id, contact_name, contact_email, contact_phone,
         shipping_address, billing_address, currency, subtotal, shipping_total, tax_total,
         grand_total, customer_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        input.orderNumber,
        input.customerId,
        input.contactName,
        input.contactEmail,
        input.contactPhone ?? null,
        JSON.stringify(input.shippingAddress),
        input.billingAddress ? JSON.stringify(input.billingAddress) : null,
        input.currency,
        input.subtotal,
        input.shippingTotal,
        input.taxTotal,
        input.grandTotal,
        input.customerNotes ?? null,
      ]
    );
    return result.rows[0];
  },

  async insertOrderItem(client: PoolClient, input: InsertOrderItemInput): Promise<OrderItemRecord> {
    const result = await client.query<OrderItemRecord>(
      `INSERT INTO order_items
        (order_id, product_id, variant_id, product_name, variant_name, sku, unit_price, quantity, line_total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        input.orderId,
        input.productId,
        input.variantId,
        input.productName,
        input.variantName,
        input.sku,
        input.unitPrice,
        input.quantity,
        input.lineTotal,
      ]
    );
    return result.rows[0];
  },

  async insertStatusHistory(
    client: PoolClient,
    input: {
      orderId: string;
      fromStatus: OrderStatus | null;
      toStatus: OrderStatus;
      note?: string | null;
      changedBy?: string | null;
    }
  ): Promise<void> {
    await client.query(
      `INSERT INTO order_status_history (order_id, from_status, to_status, note, changed_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [input.orderId, input.fromStatus, input.toStatus, input.note ?? null, input.changedBy ?? null]
    );
  },

  async updateStatus(client: PoolClient, orderId: string, status: OrderStatus): Promise<OrderRecord> {
    const result = await client.query<OrderRecord>(
      'UPDATE orders SET status = $2 WHERE id = $1 RETURNING *',
      [orderId, status]
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<OrderRecord | null> {
    const result = await query<OrderRecord>('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  },

  async findByOrderNumber(orderNumber: string): Promise<OrderRecord | null> {
    const result = await query<OrderRecord>('SELECT * FROM orders WHERE order_number = $1', [
      orderNumber,
    ]);
    return result.rows[0] ?? null;
  },

  async lockById(client: PoolClient, id: string): Promise<OrderRecord | null> {
    const result = await client.query<OrderRecord>('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [
      id,
    ]);
    return result.rows[0] ?? null;
  },

  async itemsByOrderId(orderId: string): Promise<OrderItemRecord[]> {
    const result = await query<OrderItemRecord>(
      'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC',
      [orderId]
    );
    return result.rows;
  },

  async statusHistoryByOrderId(orderId: string): Promise<OrderStatusHistoryRecord[]> {
    const result = await query<OrderStatusHistoryRecord>(
      'SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY created_at ASC',
      [orderId]
    );
    return result.rows;
  },

  async list(
    filter: OrderListFilter,
    limit: number,
    offset: number
  ): Promise<{ items: OrderRecord[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filter.status) {
      params.push(filter.status);
      conditions.push(`status = $${params.length}`);
    }
    if (filter.customerId) {
      params.push(filter.customerId);
      conditions.push(`customer_id = $${params.length}`);
    }
    if (filter.search) {
      params.push(`%${filter.search}%`);
      conditions.push(
        `(order_number ILIKE $${params.length} OR contact_email ILIKE $${params.length} OR contact_name ILIKE $${params.length})`
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const items = await query<OrderRecord>(
      `SELECT * FROM orders ${where} ORDER BY placed_at DESC LIMIT $${params.length + 1} OFFSET $${
        params.length + 2
      }`,
      [...params, limit, offset]
    );
    const count = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM orders ${where}`,
      params
    );

    return { items: items.rows, total: Number(count.rows[0].count) };
  },
};
