import { query } from '../../config/database';

export interface RefreshTokenRecord {
  id: string;
  admin_id: string;
  token_hash: string;
  user_agent: string | null;
  ip_address: string | null;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

export interface InsertRefreshTokenInput {
  id: string;
  adminId: string;
  tokenHash: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
}

export const authRepository = {
  async insertRefreshToken(input: InsertRefreshTokenInput): Promise<void> {
    await query(
      `INSERT INTO admin_refresh_tokens (id, admin_id, token_hash, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        input.id,
        input.adminId,
        input.tokenHash,
        input.userAgent ?? null,
        input.ipAddress ?? null,
        input.expiresAt,
      ]
    );
  },

  async findById(id: string): Promise<RefreshTokenRecord | null> {
    const result = await query<RefreshTokenRecord>(
      'SELECT * FROM admin_refresh_tokens WHERE id = $1',
      [id]
    );
    return result.rows[0] ?? null;
  },

  async revoke(id: string): Promise<void> {
    await query('UPDATE admin_refresh_tokens SET revoked_at = now() WHERE id = $1', [id]);
  },

  async revokeAllForAdmin(adminId: string): Promise<void> {
    await query(
      'UPDATE admin_refresh_tokens SET revoked_at = now() WHERE admin_id = $1 AND revoked_at IS NULL',
      [adminId]
    );
  },
};
