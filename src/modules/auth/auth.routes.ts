import { Router } from 'express';
import { rateLimiter, authenticateAdmin } from '../../common/middleware';
import { validate } from '../../common/validation';
import { authController } from './auth.controller';
import { loginSchema } from './auth.validation';
import { adminsController } from '../admins/admins.controller';
import { env } from '../../config/env';

const router = Router();

const loginRateLimiter = rateLimiter({
  windowMs: env.rateLimit.loginWindowMs,
  max: env.rateLimit.loginMax,
  keyPrefix: 'login',
  message: 'Too many login attempts. Please try again later.',
});

router.post('/login', loginRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticateAdmin, adminsController.me);

export default router;
