import { Request, Response } from 'express';
import { asyncHandler, sendSuccess, sendNoContent } from '../../common/utils';
import { UnauthorizedError } from '../../common/errors';
import { authService } from './auth.service';
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from './auth.constants';
import { auditLogService } from '../audit/audit.service';

function requestMeta(req: Request) {
  return { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
}

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { admin, accessToken, refreshToken, refreshTokenExpiresAt } = await authService.login(
      email,
      password,
      requestMeta(req)
    );

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      ...refreshCookieOptions,
      expires: refreshTokenExpiresAt,
    });

    await auditLogService.record({
      adminId: admin.id,
      action: 'auth.login',
      entityType: 'admin',
      entityId: admin.id,
      req,
    });

    sendSuccess(res, { admin, accessToken });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const presentedToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!presentedToken) throw new UnauthorizedError('Missing refresh token');

    const { accessToken, refreshToken, refreshTokenExpiresAt } = await authService.refresh(
      presentedToken,
      requestMeta(req)
    );

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      ...refreshCookieOptions,
      expires: refreshTokenExpiresAt,
    });

    sendSuccess(res, { accessToken });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const presentedToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await authService.logout(presentedToken);
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
    sendNoContent(res);
  }),
};
