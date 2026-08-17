import { query } from '../../config/database';
import { CategoryRecord } from './categories.types';

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  imageId?: string | null;
  parentId?: string | null;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string | null;
  imageId?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export const categoriesRepository = {
  async create(input: CreateCategoryInput): Promise<CategoryRecord> {
    const result = await query<CategoryRecord>(
      `INSERT INTO categories (name, slug, description, image_id, parent_id, sort_order)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 0))
       RETURNING *`,
      [
        input.name,
        input.slug,
        input.description ?? null,
        input.imageId ?? null,
        input.parentId ?? null,
        input.sortOrder,
      ]
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<CategoryRecord | null> {
    const result = await query<CategoryRecord>('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  },

  async findBySlug(slug: string): Promise<CategoryRecord | null> {
    const result = await query<CategoryRecord>('SELECT * FROM categories WHERE slug = $1', [
      slug,
    ]);
    return result.rows[0] ?? null;
  },

  async list(activeOnly: boolean): Promise<CategoryRecord[]> {
    const result = await query<CategoryRecord>(
      `SELECT * FROM categories
       ${activeOnly ? 'WHERE is_active = true' : ''}
       ORDER BY sort_order ASC, name ASC`
    );
    return result.rows;
  },

  async update(id: string, input: UpdateCategoryInput): Promise<CategoryRecord | null> {
    const fields: string[] = [];
    const params: unknown[] = [];

    const set = (column: string, value: unknown) => {
      params.push(value);
      fields.push(`${column} = $${params.length}`);
    };

    if (input.name !== undefined) set('name', input.name);
    if (input.slug !== undefined) set('slug', input.slug);
    if (input.description !== undefined) set('description', input.description);
    if (input.imageId !== undefined) set('image_id', input.imageId);
    if (input.parentId !== undefined) set('parent_id', input.parentId);
    if (input.sortOrder !== undefined) set('sort_order', input.sortOrder);
    if (input.isActive !== undefined) set('is_active', input.isActive);

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    const result = await query<CategoryRecord>(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return result.rows[0] ?? null;
  },

  async remove(id: string): Promise<void> {
    await query('DELETE FROM categories WHERE id = $1', [id]);
  },

  async countProducts(categoryId: string): Promise<number> {
    const result = await query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM products WHERE category_id = $1',
      [categoryId]
    );
    return Number(result.rows[0].count);
  },
};
