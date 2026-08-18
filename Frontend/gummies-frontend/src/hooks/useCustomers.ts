import { useQuery } from '@tanstack/react-query'
import * as customersApi from '@/api/customers'
import type { ListCustomersParams } from '@/api/customers'

export function useCustomersQuery(params: ListCustomersParams) {
  return useQuery({ queryKey: ['customers', 'list', params], queryFn: () => customersApi.list(params) })
}

export function useCustomerQuery(id: string) {
  return useQuery({
    queryKey: ['customers', 'detail', id],
    queryFn: () => customersApi.getById(id),
    enabled: Boolean(id),
  })
}

export function useCustomerOrderHistoryQuery(id: string) {
  return useQuery({
    queryKey: ['customers', 'orders', id],
    queryFn: () => customersApi.getOrderHistory(id),
    enabled: Boolean(id),
  })
}
