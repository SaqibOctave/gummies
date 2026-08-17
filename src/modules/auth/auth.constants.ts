import { CookieOptions } from 'express';
import { env } from '../../config/env';

export const REFRESH_COOKIE_NAME = 'refreshToken';

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax',
  path: '/',
};
