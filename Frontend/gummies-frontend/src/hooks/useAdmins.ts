import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as adminsApi from '@/api/admins'
import type { ListAdminsParams } from '@/api/admins'
import type { CreateAdminInput, UpdateAdminInput } from '@/types/admin'

const ADMINS_KEY = ['admins'] as const

export function useAdminsQuery(params: ListAdminsParams) {
  return useQuery({
    queryKey: [...ADMINS_KEY, 'list', params],
    queryFn: () => adminsApi.list(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateAdminMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAdminInput) => adminsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMINS_KEY }),
  })
}

export function useUpdateAdminMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAdminInput }) => adminsApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMINS_KEY }),
  })
}
