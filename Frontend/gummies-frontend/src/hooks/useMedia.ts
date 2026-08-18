import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as mediaApi from '@/api/media'
import type { ListMediaParams } from '@/api/media'

const listKey = (params: ListMediaParams) => ['media', 'list', params] as const

export function useMediaQuery(params: ListMediaParams) {
  return useQuery({ queryKey: listKey(params), queryFn: () => mediaApi.list(params) })
}

export function useUploadMediaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, altText }: { file: File; altText?: string }) => mediaApi.upload(file, altText),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media', 'list'] }),
  })
}

export function useDeleteMediaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mediaApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media', 'list'] }),
  })
}
