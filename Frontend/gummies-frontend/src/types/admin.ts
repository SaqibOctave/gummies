import type { Admin, AdminRole } from './auth'

export type { Admin, AdminRole }

export const ADMIN_ROLES: AdminRole[] = ['super_admin', 'admin', 'staff']

export const ADMIN_ROLE_LABEL: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  staff: 'Staff',
}

export const ADMIN_ROLE_BADGE_CLASS: Record<AdminRole, string> = {
  super_admin: 'bg-violet-100 text-violet-700',
  admin: 'bg-blue-100 text-blue-700',
  staff: 'bg-slate-100 text-slate-700',
}

export interface CreateAdminInput {
  name: string
  email: string
  password: string
  role: AdminRole
}

export interface UpdateAdminInput {
  name?: string
  role?: AdminRole
  isActive?: boolean
  password?: string
}
