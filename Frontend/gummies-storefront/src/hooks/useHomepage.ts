import { useQuery } from '@tanstack/react-query'
import * as homepageApi from '@/api/homepage'

export function useHomepageBlocksQuery() {
  return useQuery({ queryKey: ['homepage', 'public'], queryFn: homepageApi.getPublicBlocks })
}
