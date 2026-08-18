import { httpClient } from './httpClient'
import type { PaginatedResult } from '@/types/pagination'
import type { Media } from '@/types/media'

export interface ListMediaParams {
  page?: number
  limit?: number
}

export function upload(file: File, altText?: string): Promise<Media> {
  const formData = new FormData()
  formData.append('file', file)
  if (altText) formData.append('altText', altText)
  return httpClient.postForm<Media>('/media', formData)
}

export function list(params: ListMediaParams = {}): Promise<PaginatedResult<Media>> {
  const usp = new URLSearchParams()
  if (params.page) usp.set('page', String(params.page))
  if (params.limit) usp.set('limit', String(params.limit))
  const qs = usp.toString()
  return httpClient.getPaginated<Media>(`/media${qs ? `?${qs}` : ''}`)
}

export function getById(id: string): Promise<Media> {
  return httpClient.get<Media>(`/media/${id}`)
}

export function remove(id: string): Promise<void> {
  return httpClient.delete<void>(`/media/${id}`)
}
