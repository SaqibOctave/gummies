import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as productsApi from '@/api/products'
import type { ListProductsParams } from '@/api/products'
import type { ProductInput, VariantInput } from '@/types/product'

const listKey = (params: ListProductsParams) => ['products', 'list', params] as const
const detailKey = (id: string) => ['products', 'detail', id] as const

export function useProductsQuery(params: ListProductsParams) {
  return useQuery({ queryKey: listKey(params), queryFn: () => productsApi.list(params) })
}

export function useProductQuery(id: string) {
  return useQuery({ queryKey: detailKey(id), queryFn: () => productsApi.getById(id), enabled: Boolean(id) })
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductInput) => productsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products', 'list'] }),
  })
}

export function useUpdateProductMutation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<ProductInput>) => productsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: detailKey(id) })
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] })
    },
  })
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products', 'list'] }),
  })
}

export function useAddVariantMutation(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: VariantInput) => productsApi.addVariant(productId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: detailKey(productId) }),
  })
}

export function useUpdateVariantMutation(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ variantId, input }: { variantId: string; input: Partial<VariantInput> }) =>
      productsApi.updateVariant(productId, variantId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: detailKey(productId) }),
  })
}

export function useRemoveVariantMutation(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variantId: string) => productsApi.removeVariant(productId, variantId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: detailKey(productId) }),
  })
}

export function useAttachImageMutation(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ mediaId, isPrimary }: { mediaId: string; isPrimary?: boolean }) =>
      productsApi.attachImage(productId, mediaId, isPrimary),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: detailKey(productId) }),
  })
}

export function useSetPrimaryImageMutation(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (imageId: string) => productsApi.setPrimaryImage(productId, imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: detailKey(productId) }),
  })
}

export function useRemoveImageMutation(productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (imageId: string) => productsApi.removeImage(productId, imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: detailKey(productId) }),
  })
}
