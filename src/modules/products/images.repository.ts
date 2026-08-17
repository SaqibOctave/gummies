import { query } from '../../config/database';
import { ProductImageRecord } from './products.types';

export const imagesRepository = {
  async attach(
    productId: string,
    mediaId: string,
    sortOrder: number,
    isPrimary: boolean
  ): Promise<ProductImageRecord> {
    const result = await query<ProductImageRecord>(
      `INSERT INTO product_images (product_id, media_id, sort_order, is_primary)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [productId, mediaId, sortOrder, isPrimary]
    );
    return result.rows[0];
  },

  async listByProduct(productId: string): Promise<ProductImageRecord[]> {
    const result = await query<ProductImageRecord>(
      `SELECT pi.*, m.url, m.alt_text
       FROM product_images pi
       JOIN media m ON m.id = pi.media_id
       WHERE pi.product_id = $1
       ORDER BY pi.is_primary DESC, pi.sort_order ASC`,
      [productId]
    );
    return result.rows;
  },

  async findById(id: string): Promise<ProductImageRecord | null> {
    const result = await query<ProductImageRecord>('SELECT * FROM product_images WHERE id = $1', [
      id,
    ]);
    return result.rows[0] ?? null;
  },

  async unsetPrimaryForProduct(productId: string): Promise<void> {
    await query('UPDATE product_images SET is_primary = false WHERE product_id = $1', [
      productId,
    ]);
  },

  async setPrimary(id: string): Promise<void> {
    await query('UPDATE product_images SET is_primary = true WHERE id = $1', [id]);
  },

  async remove(id: string): Promise<void> {
    await query('DELETE FROM product_images WHERE id = $1', [id]);
  },
};
