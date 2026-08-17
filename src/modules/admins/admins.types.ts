import { AdminRole } from '../../common/constants/roles';

export interface AdminRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: AdminRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type SafeAdmin = Omit<AdminRecord, 'password_hash'>;

export function toSafeAdmin(admin: AdminRecord): SafeAdmin {
  const { password_hash: _password_hash, ...safe } = admin;
  return safe;
}
