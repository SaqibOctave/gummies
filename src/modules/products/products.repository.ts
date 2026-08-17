import { query } from '../../config/database';
import { ProductRecord } from './products.types';

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

export interface ProductListFilter {
  categoryId?: string;
  search?: string;
  activeOnly?: boolean;
}

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
  ): Promise<{ items: ProductRecord[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filter.categoryId) {
      params.push(filter.categoryId);
      conditions.push(`category_id = $${params.length}`);
    }
    if (filter.activeOnly) {
      conditions.push('is_active = true');
    }
    if (filter.search) {
      params.push(`%${filter.search}%`);
      conditions.push(`name ILIKE $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const items = await query<ProductRecord>(
      `SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${
        params.length + 2
      }`,
      [...params, limit, offset]
    );
    const count = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM products ${where}`,
      params
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
