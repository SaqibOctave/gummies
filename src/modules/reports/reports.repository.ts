import { query } from '../../config/database';

const REVENUE_COUNTED_STATUSES = ['confirmed', 'processing', 'shipped', 'delivered'];

export const reportsRepository = {
  async salesSummary(dateFrom?: string, dateTo?: string) {
    const params: unknown[] = [REVENUE_COUNTED_STATUSES];
    let range = '';
    if (dateFrom) {
      params.push(dateFrom);
      range += ` AND placed_at >= $${params.length}`;
    }
    if (dateTo) {
      params.push(dateTo);
      range += ` AND placed_at <= $${params.length}`;
    }

    const result = await query<{
      order_count: string;
      total_revenue: string | null;
      average_order_value: string | null;
    }>(
      `SELECT COUNT(*)::text AS order_count,
              COALESCE(SUM(grand_total), 0)::text AS total_revenue,
              COALESCE(AVG(grand_total), 0)::text AS average_order_value
       FROM orders
       WHERE status = ANY($1) ${range}`,
      params
    );
    return result.rows[0];
  },

  async ordersByStatus() {
    const result = await query<{ status: string; count: string }>(
      `SELECT status, COUNT(*)::text AS count FROM orders GROUP BY status`
    );
    return result.rows;
  },

  async topProducts(limit: number, dateFrom?: string, dateTo?: string) {
    const params: unknown[] = [REVENUE_COUNTED_STATUSES];
    let range = '';
    if (dateFrom) {
      params.push(dateFrom);
      range += ` AND o.placed_at >= $${params.length}`;
    }
    if (dateTo) {
      params.push(dateTo);
      range += ` AND o.placed_at <= $${params.length}`;
    }
    params.push(limit);

    const result = await query<{
      product_id: string;
      product_name: string;
      total_quantity: string;
      total_revenue: string;
    }>(
      `SELECT oi.product_id, oi.product_name,
              SUM(oi.quantity)::text AS total_quantity,
              SUM(oi.line_total)::text AS total_revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status = ANY($1) ${range}
       GROUP BY oi.product_id, oi.product_name
       ORDER BY SUM(oi.quantity) DESC
       LIMIT $${params.length}`,
      params
    );
    return result.rows;
  },

  async revenueOverTime(dateFrom: string, dateTo: string) {
    const result = await query<{ day: string; revenue: string; order_count: string }>(
      `SELECT to_char(date_trunc('day', placed_at), 'YYYY-MM-DD') AS day,
              COALESCE(SUM(grand_total), 0)::text AS revenue,
              COUNT(*)::text AS order_count
       FROM orders
       WHERE status = ANY($1) AND placed_at >= $2 AND placed_at <= $3
       GROUP BY date_trunc('day', placed_at)
       ORDER BY date_trunc('day', placed_at) ASC`,
      [REVENUE_COUNTED_STATUSES, dateFrom, dateTo]
    );
    return result.rows;
  },

  async counts() {
    const result = await query<{
      total_products: string;
      total_categories: string;
      total_customers: string;
      low_stock_variants: string;
    }>(
      `SELECT
        (SELECT COUNT(*)::text FROM products WHERE is_active = true) AS total_products,
        (SELECT COUNT(*)::text FROM categories WHERE is_active = true) AS total_categories,
        (SELECT COUNT(*)::text FROM customers) AS total_customers,
        (SELECT COUNT(*)::text FROM inventory WHERE (quantity_on_hand - quantity_reserved) <= low_stock_threshold) AS low_stock_variants
      `
    );
    return result.rows[0];
  },
};
