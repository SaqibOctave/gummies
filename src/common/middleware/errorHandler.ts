import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors';
import { logger } from '../utils/logger';
import { formatError } from '../utils/formatError';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    if (!err.isOperational || err.statusCode >= 500) {
      logger.error(err.message, { code: err.code, stack: err.stack, path: req.originalUrl });
    } else {
      logger.warn(err.message, { code: err.code, path: req.originalUrl });
    }
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  logger.error('Unhandled error', {
    message: formatError(err),
    stack: err instanceof Error ? err.stack : undefined,
    path: req.originalUrl,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
