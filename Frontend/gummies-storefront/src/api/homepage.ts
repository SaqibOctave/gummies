import { httpClient } from './httpClient'
import type { HomepageBlock } from '@/types/homepage'

export function getPublicBlocks(): Promise<HomepageBlock[]> {
  return httpClient.get<HomepageBlock[]>('/homepage/public')
}
