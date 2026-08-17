import { query } from '../../config/database';
import { MediaRecord } from './media.types';

export interface CreateMediaInput {
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageDriver: 'local' | 'minio';
  storageKey: string;
  url: string;
  altText?: string | null;
  uploadedBy?: string | null;
}

export const mediaRepository = {
  async create(input: CreateMediaInput): Promise<MediaRecord> {
    const result = await query<MediaRecord>(
      `INSERT INTO media
        (file_name, original_name, mime_type, size_bytes, storage_driver, storage_key, url, alt_text, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        input.fileName,
        input.originalName,
        input.mimeType,
        input.sizeBytes,
        input.storageDriver,
        input.storageKey,
        input.url,
        input.altText ?? null,
        input.uploadedBy ?? null,
      ]
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<MediaRecord | null> {
    const result = await query<MediaRecord>('SELECT * FROM media WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  },

  async list(limit: number, offset: number): Promise<{ items: MediaRecord[]; total: number }> {
    const [items, count] = await Promise.all([
      query<MediaRecord>(
        'SELECT * FROM media ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      query<{ count: string }>('SELECT COUNT(*)::text AS count FROM media'),
    ]);
    return { items: items.rows, total: Number(count.rows[0].count) };
  },

  async remove(id: string): Promise<void> {
    await query('DELETE FROM media WHERE id = $1', [id]);
  },
};
