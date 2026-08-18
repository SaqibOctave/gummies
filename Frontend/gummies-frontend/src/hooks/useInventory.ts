import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as inventoryApi from '@/api/inventory'
import type { ListInventoryParams } from '@/api/inventory'

const listKey = (params: ListInventoryParams) => ['inventory', 'list', params] as const
const detailKey = (variantId: string) => ['inventory', 'detail', variantId] as const
const movementsKey = (variantId: string) => ['inventory', 'movements', variantId] as const

export function useInventoryQuery(params: ListInventoryParams) {
  return useQuery({ queryKey: listKey(params), queryFn: () => inventoryApi.list(params) })
}

export function useInventoryDetailQuery(variantId: string) {
  return useQuery({
    queryKey: detailKey(variantId),
    queryFn: () => inventoryApi.getByVariant(variantId),
    enabled: Boolean(variantId),
  })
}

export function useInventoryMovementsQuery(variantId: string) {
  return useQuery({
    queryKey: movementsKey(variantId),
    queryFn: () => inventoryApi.listMovements(variantId, { page: 1, limit: 15 }),
    enabled: Boolean(variantId),
  })
}

function useInvalidateAfterMutation(variantId: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: detailKey(variantId) })
    queryClient.invalidateQueries({ queryKey: movementsKey(variantId) })
    queryClient.invalidateQueries({ queryKey: ['inventory', 'list'] })
  }
}

export function useRestockMutation(variantId: string) {
  const invalidate = useInvalidateAfterMutation(variantId)
  return useMutation({
    mutationFn: ({ quantity, note }: { quantity: number; note?: string }) =>
      inventoryApi.restock(variantId, quantity, note),
    onSuccess: invalidate,
  })
}

export function useAdjustMutation(variantId: string) {
  const invalidate = useInvalidateAfterMutation(variantId)
  return useMutation({
    mutationFn: ({ delta, note }: { delta: number; note?: string }) => inventoryApi.adjust(variantId, delta, note),
    onSuccess: invalidate,
  })
}

export function useSetThresholdMutation(variantId: string) {
  const invalidate = useInvalidateAfterMutation(variantId)
  return useMutation({
    mutationFn: (threshold: number) => inventoryApi.setThreshold(variantId, threshold),
    onSuccess: invalidate,
  })
}
