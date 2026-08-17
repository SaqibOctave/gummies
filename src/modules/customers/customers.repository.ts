import { PoolClient } from 'pg';
import { query } from '../../config/database';
import { CustomerRecord } from './customers.types';

export const customersRepository = {
  async findByEmail(email: string): Promise<CustomerRecord | null> {
    const result = await query<CustomerRecord>('SELECT * FROM customers WHERE email = $1', [
      email.toLowerCase(),
    ]);
    return result.rows[0] ?? null;
  },

  async findById(id: string): Promise<CustomerRecord | null> {
    const result = await query<CustomerRecord>('SELECT * FROM customers WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  },

  async list(
    search: string | undefined,
    limit: number,
    offset: number
  ): Promise<{ items: CustomerRecord[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const items = await query<CustomerRecord>(
      `SELECT * FROM customers ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${
        params.length + 2
      }`,
      [...params, limit, offset]
    );
    const count = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM customers ${where}`,
      params
    );
    return { items: items.rows, total: Number(count.rows[0].count) };
  },

  // Called inside the order-creation transaction, so it takes the shared client.
  async findOrCreateWithClient(
    client: PoolClient,
    input: { name: string; email: string; phone?: string | null }
  ): Promise<CustomerRecord> {
    const email = input.email.toLowerCase().trim();
    const existing = await client.query<CustomerRecord>(
      'SELECT * FROM customers WHERE email = $1',
      [email]
    );
    if (existing.rows[0]) {
      const updated = await client.query<CustomerRecord>(
        `UPDATE customers SET name = $2, phone = COALESCE($3, phone) WHERE email = $1 RETURNING *`,
        [email, input.name, input.phone ?? null]
      );
      return updated.rows[0];
    }

    const created = await client.query<CustomerRecord>(
      `INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING *`,
      [input.name, email, input.phone ?? null]
    );
    return created.rows[0];
  },
};
