export type AdminRole = 'super_admin' | 'admin' | 'staff'

export interface Admin {
  id: string
  name: string
  email: string
  role: AdminRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginResponse {
  admin: Admin
  accessToken: string
}

export interface RefreshResponse {
  accessToken: string
}
