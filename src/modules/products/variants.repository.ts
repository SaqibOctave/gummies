import { query } from '../../config/database';
import { ProductVariantRecord, VariantWithAvailability } from './products.types';

export interface CreateVariantInput {
  productId: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  attributes?: Record<string, unknown>;
  sortOrder?: number;
}

export interface UpdateVariantInput {
  sku?: string;
  name?: string;
  price?: number;
  compareAtPrice?: number | null;
  attributes?: Record<string, unknown>;
  isActive?: boolean;
  sortOrder?: number;
}

export const variantsRepository = {
  async create(input: CreateVariantInput): Promise<ProductVariantRecord> {
    const result = await query<ProductVariantRecord>(
      `INSERT INTO product_variants (product_id, sku, name, price, compare_at_price, attributes, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 0))
       RETURNING *`,
      [
        input.productId,
        input.sku,
        input.name,
        input.price,
        input.compareAtPrice ?? null,
        JSON.stringify(input.attributes ?? {}),
        input.sortOrder,
      ]
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<ProductVariantRecord | null> {
    const result = await query<ProductVariantRecord>(
      'SELECT * FROM product_variants WHERE id = $1',
      [id]
    );
    return result.rows[0] ?? null;
  },

  async findPurchasableById(id: string): Promise<
    | (ProductVariantRecord & { product_name: string; product_is_active: boolean })
    | null
  > {
    const result = await query<ProductVariantRecord & { product_name: string; product_is_active: boolean }>(
      `SELECT v.*, p.name AS product_name, p.is_active AS product_is_active
       FROM product_variants v
       JOIN products p ON p.id = v.product_id
       WHERE v.id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  },

  async findBySku(sku: string): Promise<ProductVariantRecord | null> {
    const result = await query<ProductVariantRecord>(
      'SELECT * FROM product_variants WHERE sku = $1',
      [sku]
    );
    return result.rows[0] ?? null;
  },

  async listByProduct(productId: string, activeOnly: boolean): Promise<ProductVariantRecord[]> {
    const result = await query<ProductVariantRecord>(
      `SELECT * FROM product_variants
       WHERE product_id = $1 ${activeOnly ? 'AND is_active = true' : ''}
       ORDER BY sort_order ASC, created_at ASC`,
      [productId]
    );
    return result.rows;
  },

  async listByProductWithAvailability(
    productId: string,
    activeOnly: boolean
  ): Promise<VariantWithAvailability[]> {
    const result = await query<VariantWithAvailability>(
      `SELECT v.*,
              COALESCE(i.quantity_on_hand, 0) AS quantity_on_hand,
              COALESCE(i.quantity_reserved, 0) AS quantity_reserved,
              COALESCE(i.quantity_on_hand, 0) - COALESCE(i.quantity_reserved, 0) AS available_quantity
       FROM product_variants v
       LEFT JOIN inventory i ON i.variant_id = v.id
       WHERE v.product_id = $1 ${activeOnly ? 'AND v.is_active = true' : ''}
       ORDER BY v.sort_order ASC, v.created_at ASC`,
      [productId]
    );
    return result.rows;
  },

  async update(id: string, input: UpdateVariantInput): Promise<ProductVariantRecord | null> {
    const fields: string[] = [];
    const params: unknown[] = [];
    const set = (column: string, value: unknown) => {
      params.push(value);
      fields.push(`${column} = $${params.length}`);
    };

    if (input.sku !== undefined) set('sku', input.sku);
    if (input.name !== undefined) set('name', input.name);
    if (input.price !== undefined) set('price', input.price);
    if (input.compareAtPrice !== undefined) set('compare_at_price', input.compareAtPrice);
    if (input.attributes !== undefined) set('attributes', JSON.stringify(input.attributes));
    if (input.isActive !== undefined) set('is_active', input.isActive);
    if (input.sortOrder !== undefined) set('sort_order', input.sortOrder);

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    const result = await query<ProductVariantRecord>(
      `UPDATE product_variants SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return result.rows[0] ?? null;
  },

  async remove(id: string): Promise<void> {
    await query('DELETE FROM product_variants WHERE id = $1', [id]);
  },
};
