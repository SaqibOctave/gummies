import { query } from '../../config/database';
import { ProductRecord, ProductListItem } from './products.types';

export interface CreateProductInput {
  categoryId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  basePrice: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface UpdateProductInput {
  categoryId?: string | null;
  name?: string;
  slug?: string;
  description?: string | null;
  shortDescription?: string | null;
  basePrice?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  isActive?: boolean;
}

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'best_selling';

export interface ProductListFilter {
  categoryId?: string;
  search?: string;
  activeOnly?: boolean;
  sort?: ProductSort;
}

const REVENUE_COUNTED_STATUSES = ['confirmed', 'processing', 'shipped', 'delivered'];

const SORT_CLAUSES: Record<ProductSort, string> = {
  newest: 'p.created_at DESC',
  price_asc: 'p.base_price ASC, p.created_at DESC',
  price_desc: 'p.base_price DESC, p.created_at DESC',
  name_asc: 'p.name ASC',
  best_selling: 'COALESCE(sold.total_quantity, 0) DESC, p.created_at DESC',
};

export const productsRepository = {
  async create(input: CreateProductInput): Promise<ProductRecord> {
    const result = await query<ProductRecord>(
      `INSERT INTO products
        (category_id, name, slug, description, short_description, base_price, meta_title, meta_description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        input.categoryId ?? null,
        input.name,
        input.slug,
        input.description ?? null,
        input.shortDescription ?? null,
        input.basePrice,
        input.metaTitle ?? null,
        input.metaDescription ?? null,
      ]
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<ProductRecord | null> {
    const result = await query<ProductRecord>('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  },

  async findBySlug(slug: string): Promise<ProductRecord | null> {
    const result = await query<ProductRecord>('SELECT * FROM products WHERE slug = $1', [slug]);
    return result.rows[0] ?? null;
  },

  async list(
    filter: ProductListFilter,
    limit: number,
    offset: number
  ): Promise<{ items: ProductListItem[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filter.categoryId) {
      params.push(filter.categoryId);
      conditions.push(`p.category_id = $${params.length}`);
    }
    if (filter.activeOnly) {
      conditions.push('p.is_active = true');
    }
    if (filter.search) {
      params.push(`%${filter.search}%`);
      conditions.push(`p.name ILIKE $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countParams = [...params];
    const sort = filter.sort ?? 'newest';

    const soldJoin =
      sort === 'best_selling'
        ? `LEFT JOIN LATERAL (
             SELECT SUM(oi.quantity) AS total_quantity
             FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             WHERE oi.product_id = p.id AND o.status = ANY($${params.length + 1})
           ) sold ON true`
        : '';
    if (sort === 'best_selling') params.push(REVENUE_COUNTED_STATUSES);

    const items = await query<ProductListItem>(
      `SELECT p.*, img.url AS primary_image_url, img.alt_text AS primary_image_alt,
              COALESCE(stock.available, true) AS in_stock
       FROM products p
       LEFT JOIN LATERAL (
         SELECT m.url, m.alt_text
         FROM product_images pi
         JOIN media m ON m.id = pi.media_id
         WHERE pi.product_id = p.id
         ORDER BY pi.is_primary DESC, pi.sort_order ASC
         LIMIT 1
       ) img ON true
       LEFT JOIN LATERAL (
         SELECT bool_or(COALESCE(i.quantity_on_hand, 0) - COALESCE(i.quantity_reserved, 0) > 0) AS available
         FROM product_variants v
         LEFT JOIN inventory i ON i.variant_id = v.id
         WHERE v.product_id = p.id AND v.is_active = true
       ) stock ON true
       ${soldJoin}
       ${where}
       ORDER BY ${SORT_CLAUSES[sort]} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    const count = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM products p ${where}`,
      countParams
    );

    return { items: items.rows, total: Number(count.rows[0].count) };
  },

  async update(id: string, input: UpdateProductInput): Promise<ProductRecord | null> {
    const fields: string[] = [];
    const params: unknown[] = [];
    const set = (column: string, value: unknown) => {
      params.push(value);
      fields.push(`${column} = $${params.length}`);
    };

    if (input.categoryId !== undefined) set('category_id', input.categoryId);
    if (input.name !== undefined) set('name', input.name);
    if (input.slug !== undefined) set('slug', input.slug);
    if (input.description !== undefined) set('description', input.description);
    if (input.shortDescription !== undefined) set('short_description', input.shortDescription);
    if (input.basePrice !== undefined) set('base_price', input.basePrice);
    if (input.metaTitle !== undefined) set('meta_title', input.metaTitle);
    if (input.metaDescription !== undefined) set('meta_description', input.metaDescription);
    if (input.isActive !== undefined) set('is_active', input.isActive);

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    const result = await query<ProductRecord>(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return result.rows[0] ?? null;
  },

  async remove(id: string): Promise<void> {
    await query('DELETE FROM products WHERE id = $1', [id]);
  },
};
