export const ADMIN_ROLES = ['super_admin', 'admin', 'staff'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ROLE_HIERARCHY: Record<AdminRole, number> = {
  super_admin: 3,
  admin: 2,
  staff: 1,
};
