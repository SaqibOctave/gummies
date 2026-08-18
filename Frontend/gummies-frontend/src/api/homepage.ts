import { httpClient } from './httpClient'
import type { HomepageBlock, HomepageBlockInput } from '@/types/homepage'

export function list(): Promise<HomepageBlock[]> {
  return httpClient.get<HomepageBlock[]>('/homepage')
}

export function getById(id: string): Promise<HomepageBlock> {
  return httpClient.get<HomepageBlock>(`/homepage/${id}`)
}

export function create(input: HomepageBlockInput): Promise<HomepageBlock> {
  return httpClient.post<HomepageBlock>('/homepage', input)
}

export function update(id: string, input: Partial<HomepageBlockInput>): Promise<HomepageBlock> {
  return httpClient.patch<HomepageBlock>(`/homepage/${id}`, input)
}

export function remove(id: string): Promise<void> {
  return httpClient.delete<void>(`/homepage/${id}`)
}
