import { NextFunction, Request, Response } from 'express';
import { TooManyRequestsError } from '../errors';

interface Bucket {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  message?: string;
}

// Simple fixed-window, in-memory limiter. Sufficient for a single-instance
// deployment; swap for a Redis-backed limiter if the app is horizontally scaled.
const buckets = new Map<string, Bucket>();

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 60_000).unref();

export function rateLimiter(options: RateLimiterOptions) {
  const { windowMs, max, keyPrefix = 'default', message = 'Too many requests, please try again later' } =
    options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${keyPrefix}:${req.ip}`;
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    existing.count += 1;
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(max - existing.count, 0)));

    if (existing.count > max) {
      next(new TooManyRequestsError(message));
      return;
    }

    next();
  };
}
