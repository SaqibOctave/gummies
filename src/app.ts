import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import { securityHeaders, requestLogger, rateLimiter, errorHandler, notFoundHandler } from './common/middleware';
import routes from './routes';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(securityHeaders);
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser(env.cookieSecret));
  app.use(requestLogger);
  app.use(
    rateLimiter({ windowMs: env.rateLimit.windowMs, max: env.rateLimit.max, keyPrefix: 'global' })
  );

  // Static serving for locally stored media. Swapping the storage driver to
  // MinIO later removes the need for this route; nothing else changes.
  if (env.storage.driver === 'local') {
    app.use(
      env.storage.localPublicPath,
      express.static(path.resolve(process.cwd(), env.storage.localUploadDir))
    );
  }

  app.use('/api/v1', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
