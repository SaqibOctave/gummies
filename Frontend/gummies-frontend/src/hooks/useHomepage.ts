import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as homepageApi from '@/api/homepage'
import type { HomepageBlockInput } from '@/types/homepage'

const LIST_KEY = ['homepage', 'list'] as const

export function useHomepageBlocksQuery() {
  return useQuery({ queryKey: LIST_KEY, queryFn: homepageApi.list })
}

export function useCreateHomepageBlockMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: HomepageBlockInput) => homepageApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LIST_KEY }),
  })
}

export function useUpdateHomepageBlockMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<HomepageBlockInput> }) =>
      homepageApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LIST_KEY }),
  })
}

export function useDeleteHomepageBlockMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => homepageApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LIST_KEY }),
  })
}
