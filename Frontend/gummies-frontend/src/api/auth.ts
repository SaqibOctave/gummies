import { httpClient } from './httpClient'
import type { Admin, LoginResponse, RefreshResponse } from '@/types/auth'

export function login(email: string, password: string): Promise<LoginResponse> {
  return httpClient.post<LoginResponse>('/auth/login', { email, password })
}

export function logout(): Promise<void> {
  return httpClient.post<void>('/auth/logout')
}

export function getMe(): Promise<Admin> {
  return httpClient.get<Admin>('/auth/me')
}

export function refresh(): Promise<RefreshResponse> {
  return httpClient.post<RefreshResponse>('/auth/refresh')
}
