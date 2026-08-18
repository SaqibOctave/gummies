import { useMutation } from '@tanstack/react-query'
import * as ordersApi from '@/api/orders'
import type { CreateOrderInput } from '@/types/order'

export function useCheckoutMutation() {
  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersApi.checkout(input),
  })
}
