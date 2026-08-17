import { AdminRole } from '../constants/roles';

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  role: AdminRole;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AuthenticatedAdmin;
      requestId?: string;
    }
  }
}

export {};
