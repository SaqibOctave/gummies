import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError, ForbiddenError } from '../errors';
import { verifyAccessToken } from '../utils/jwt';
import { AdminRole, ROLE_HIERARCHY } from '../constants/roles';

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice('Bearer '.length);
  }
  return null;
}

export function authenticateAdmin(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    next(new UnauthorizedError('Missing or invalid authorization header'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.admin = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
}

// Populates req.admin when a valid token is present but never rejects the
// request — used on public endpoints that return extra data to admins.
export function optionalAuthenticateAdmin(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    next();
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    req.admin = { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    // Ignore invalid/expired tokens on optional auth routes.
  }
  next();
}

// Requires the admin's role to be at or above the given minimum in the hierarchy.
export function requireMinRole(minRole: AdminRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.admin) {
      next(new UnauthorizedError());
      return;
    }
    if (ROLE_HIERARCHY[req.admin.role] < ROLE_HIERARCHY[minRole]) {
      next(new ForbiddenError('Insufficient permissions for this action'));
      return;
    }
    next();
  };
}

export function requireRoles(...roles: AdminRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.admin) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(req.admin.role)) {
      next(new ForbiddenError('Insufficient permissions for this action'));
      return;
    }
    next();
  };
}
