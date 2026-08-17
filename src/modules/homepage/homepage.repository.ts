import { query } from '../../config/database';
import { HomepageBlockRecord, HomepageBlockType } from './homepage.types';

export interface CreateHomepageBlockInput {
  type: HomepageBlockType;
  title?: string | null;
  config?: Record<string, unknown>;
  sortOrder?: number;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface UpdateHomepageBlockInput {
  title?: string | null;
  config?: Record<string, unknown>;
  sortOrder?: number;
  isActive?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export const homepageRepository = {
  async create(input: CreateHomepageBlockInput): Promise<HomepageBlockRecord> {
    const result = await query<HomepageBlockRecord>(
      `INSERT INTO homepage_blocks (type, title, config, sort_order, starts_at, ends_at)
       VALUES ($1, $2, $3, COALESCE($4, 0), $5, $6)
       RETURNING *`,
      [
        input.type,
        input.title ?? null,
        JSON.stringify(input.config ?? {}),
        input.sortOrder,
        input.startsAt ?? null,
        input.endsAt ?? null,
      ]
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<HomepageBlockRecord | null> {
    const result = await query<HomepageBlockRecord>(
      'SELECT * FROM homepage_blocks WHERE id = $1',
      [id]
    );
    return result.rows[0] ?? null;
  },

  async listActive(): Promise<HomepageBlockRecord[]> {
    const result = await query<HomepageBlockRecord>(
      `SELECT * FROM homepage_blocks
       WHERE is_active = true
         AND (starts_at IS NULL OR starts_at <= now())
         AND (ends_at IS NULL OR ends_at >= now())
       ORDER BY sort_order ASC`
    );
    return result.rows;
  },

  async listAll(): Promise<HomepageBlockRecord[]> {
    const result = await query<HomepageBlockRecord>(
      'SELECT * FROM homepage_blocks ORDER BY sort_order ASC'
    );
    return result.rows;
  },

  async update(id: string, input: UpdateHomepageBlockInput): Promise<HomepageBlockRecord | null> {
    const fields: string[] = [];
    const params: unknown[] = [];
    const set = (column: string, value: unknown) => {
      params.push(value);
      fields.push(`${column} = $${params.length}`);
    };

    if (input.title !== undefined) set('title', input.title);
    if (input.config !== undefined) set('config', JSON.stringify(input.config));
    if (input.sortOrder !== undefined) set('sort_order', input.sortOrder);
    if (input.isActive !== undefined) set('is_active', input.isActive);
    if (input.startsAt !== undefined) set('starts_at', input.startsAt);
    if (input.endsAt !== undefined) set('ends_at', input.endsAt);

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    const result = await query<HomepageBlockRecord>(
      `UPDATE homepage_blocks SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return result.rows[0] ?? null;
  },

  async remove(id: string): Promise<void> {
    await query('DELETE FROM homepage_blocks WHERE id = $1', [id]);
  },
};
