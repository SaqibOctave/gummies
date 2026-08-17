import { query } from '../../config/database';
import { AdminRecord } from './admins.types';
import { AdminRole } from '../../common/constants/roles';

export interface CreateAdminInput {
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
}

export interface UpdateAdminInput {
  name?: string;
  role?: AdminRole;
  isActive?: boolean;
  passwordHash?: string;
}

export const adminsRepository = {
  async create(input: CreateAdminInput): Promise<AdminRecord> {
    const result = await query<AdminRecord>(
      `INSERT INTO admins (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.name, input.email, input.passwordHash, input.role]
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<AdminRecord | null> {
    const result = await query<AdminRecord>('SELECT * FROM admins WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  },

  async findByEmail(email: string): Promise<AdminRecord | null> {
    const result = await query<AdminRecord>('SELECT * FROM admins WHERE email = $1', [
      email.toLowerCase(),
    ]);
    return result.rows[0] ?? null;
  },

  async list(limit: number, offset: number): Promise<{ items: AdminRecord[]; total: number }> {
    const [items, count] = await Promise.all([
      query<AdminRecord>(
        'SELECT * FROM admins ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      query<{ count: string }>('SELECT COUNT(*)::text AS count FROM admins'),
    ]);
    return { items: items.rows, total: Number(count.rows[0].count) };
  },

  async update(id: string, input: UpdateAdminInput): Promise<AdminRecord | null> {
    const fields: string[] = [];
    const params: unknown[] = [];

    if (input.name !== undefined) {
      params.push(input.name);
      fields.push(`name = $${params.length}`);
    }
    if (input.role !== undefined) {
      params.push(input.role);
      fields.push(`role = $${params.length}`);
    }
    if (input.isActive !== undefined) {
      params.push(input.isActive);
      fields.push(`is_active = $${params.length}`);
    }
    if (input.passwordHash !== undefined) {
      params.push(input.passwordHash);
      fields.push(`password_hash = $${params.length}`);
    }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    const result = await query<AdminRecord>(
      `UPDATE admins SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return result.rows[0] ?? null;
  },

  async countByRole(role: AdminRole): Promise<number> {
    const result = await query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM admins WHERE role = $1 AND is_active = true',
      [role]
    );
    return Number(result.rows[0].count);
  },
};
