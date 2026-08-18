import { httpClient } from './httpClient'
import type { PaginatedResult } from '@/types/pagination'
import type { Admin, CreateAdminInput, UpdateAdminInput } from '@/types/admin'

export interface ListAdminsParams {
  page?: number
  limit?: number
}

function toQueryString(params: object): string {
  const usp = new URLSearchParams()
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined && value !== '') usp.set(key, String(value))
  }
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}

export function list(params: ListAdminsParams = {}): Promise<PaginatedResult<Admin>> {
  return httpClient.getPaginated<Admin>(`/admins${toQueryString(params)}`)
}

export function getById(id: string): Promise<Admin> {
  return httpClient.get<Admin>(`/admins/${id}`)
}

export function create(input: CreateAdminInput): Promise<Admin> {
  return httpClient.post<Admin>('/admins', input)
}

export function update(id: string, input: UpdateAdminInput): Promise<Admin> {
  return httpClient.patch<Admin>(`/admins/${id}`, input)
}
