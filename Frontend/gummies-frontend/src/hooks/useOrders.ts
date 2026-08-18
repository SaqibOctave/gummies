import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as ordersApi from '@/api/orders'
import type { ListOrdersParams } from '@/api/orders'
import type { OrderStatus } from '@/types/order'

const listKey = (params: ListOrdersParams) => ['orders', 'list', params] as const
const detailKey = (id: string) => ['orders', 'detail', id] as const

export function useOrdersQuery(params: ListOrdersParams) {
  return useQuery({ queryKey: listKey(params), queryFn: () => ordersApi.list(params) })
}

export function useOrderQuery(id: string) {
  return useQuery({ queryKey: detailKey(id), queryFn: () => ordersApi.getById(id), enabled: Boolean(id) })
}

export function useUpdateOrderStatusMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ status, note }: { status: OrderStatus; note?: string }) => ordersApi.updateStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: detailKey(id) })
      queryClient.invalidateQueries({ queryKey: ['orders', 'list'] })
    },
  })
}
