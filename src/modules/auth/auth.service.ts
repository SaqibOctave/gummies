import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { adminsRepository } from '../admins/admins.repository';
import { authRepository } from './auth.repository';
import { comparePassword } from '../../common/utils/password';
import { sha256 } from '../../common/utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../common/utils/jwt';
import { UnauthorizedError } from '../../common/errors';
import { toSafeAdmin, SafeAdmin } from '../admins/admins.types';

interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

interface LoginResult {
  admin: SafeAdmin;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

async function issueRefreshToken(adminId: string, meta: RequestMeta): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const tokenId = crypto.randomUUID();
  const token = signRefreshToken({ sub: adminId, tokenId });
  const decoded = jwt.decode(token) as { exp: number };
  const expiresAt = new Date(decoded.exp * 1000);

  await authRepository.insertRefreshToken({
    id: tokenId,
    adminId,
    tokenHash: sha256(token),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
    expiresAt,
  });

  return { token, expiresAt };
}

export const authService = {
  async login(email: string, password: string, meta: RequestMeta): Promise<LoginResult> {
    const admin = await adminsRepository.findByEmail(email);
    if (!admin || !admin.is_active) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatches = await comparePassword(password, admin.password_hash);
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = signAccessToken({ sub: admin.id, email: admin.email, role: admin.role });
    const { token: refreshToken, expiresAt } = await issueRefreshToken(admin.id, meta);

    return {
      admin: toSafeAdmin(admin),
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: expiresAt,
    };
  },

  async refresh(
    presentedToken: string,
    meta: RequestMeta
  ): Promise<{ accessToken: string; refreshToken: string; refreshTokenExpiresAt: Date }> {
    let payload;
    try {
      payload = verifyRefreshToken(presentedToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const record = await authRepository.findById(payload.tokenId);
    if (
      !record ||
      record.revoked_at !== null ||
      record.expires_at.getTime() < Date.now() ||
      record.token_hash !== sha256(presentedToken)
    ) {
      throw new UnauthorizedError('Refresh token is no longer valid');
    }

    const admin = await adminsRepository.findById(record.admin_id);
    if (!admin || !admin.is_active) {
      throw new UnauthorizedError('Account is no longer active');
    }

    await authRepository.revoke(record.id);

    const accessToken = signAccessToken({ sub: admin.id, email: admin.email, role: admin.role });
    const { token: refreshToken, expiresAt } = await issueRefreshToken(admin.id, meta);

    return { accessToken, refreshToken, refreshTokenExpiresAt: expiresAt };
  },

  async logout(presentedToken: string | undefined): Promise<void> {
    if (!presentedToken) return;
    try {
      const payload = verifyRefreshToken(presentedToken);
      await authRepository.revoke(payload.tokenId);
    } catch {
      // Token already invalid/expired — nothing to revoke.
    }
  },
};
