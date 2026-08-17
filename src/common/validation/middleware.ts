import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../errors';
import { Schema } from './types';
import { runValidation } from './validate';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: Schema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const source = (req[part] ?? {}) as Record<string, unknown>;
    const { valid, errors, data } = runValidation(schema, source);

    if (!valid) {
      next(new ValidationError('Validation failed', errors));
      return;
    }

    if (part === 'query') {
      Object.assign(req.query, data);
    } else if (part === 'params') {
      Object.assign(req.params, data);
    } else {
      req.body = data;
    }
    next();
  };
}
