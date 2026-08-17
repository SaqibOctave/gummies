import { query } from '../../config/database';
import { SettingRecord } from './settings.types';

export const settingsRepository = {
  async findByKey(key: string): Promise<SettingRecord | null> {
    const result = await query<SettingRecord>('SELECT * FROM settings WHERE key = $1', [key]);
    return result.rows[0] ?? null;
  },

  async findByKeys(keys: readonly string[]): Promise<SettingRecord[]> {
    const result = await query<SettingRecord>('SELECT * FROM settings WHERE key = ANY($1)', [
      keys,
    ]);
    return result.rows;
  },

  async list(): Promise<SettingRecord[]> {
    const result = await query<SettingRecord>('SELECT * FROM settings ORDER BY key ASC');
    return result.rows;
  },

  async upsert(key: string, value: unknown, adminId: string): Promise<SettingRecord> {
    const result = await query<SettingRecord>(
      `INSERT INTO settings (key, value, updated_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by
       RETURNING *`,
      [key, JSON.stringify(value), adminId]
    );
    return result.rows[0];
  },
};
