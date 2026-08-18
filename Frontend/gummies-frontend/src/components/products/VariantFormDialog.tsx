import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog } from '@/components/ui/Dialog'
import { useAddVariantMutation, useUpdateVariantMutation } from '@/hooks/useProducts'
import { ApiError } from '@/api/httpClient'
import type { ProductVariant } from '@/types/product'

const variantFormSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(64),
  name: z.string().min(1, 'Name is required').max(150),
  price: z.number().min(0, 'Must be 0 or more'),
  compareAtPrice: z.string().optional(),
  sortOrder: z.number().int('Must be a whole number').min(0),
  isActive: z.boolean(),
  attributes: z.array(z.object({ key: z.string(), value: z.string() })),
  initialQuantity: z.number().int('Must be a whole number').min(0),
  lowStockThreshold: z.number().int('Must be a whole number').min(0),
})

type VariantFormValues = z.infer<typeof variantFormSchema>

interface VariantFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  variant?: ProductVariant
}

export function VariantFormDialog({ open, onOpenChange, productId, variant }: VariantFormDialogProps) {
  const isEditMode = Boolean(variant)
  const addMutation = useAddVariantMutation(productId)
  const updateMutation = useUpdateVariantMutation(productId)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      sku: variant?.sku ?? '',
      name: variant?.name ?? '',
      price: variant ? Number(variant.price) : 0,
      compareAtPrice: variant?.compare_at_price ? String(Number(variant.compare_at_price)) : '',
      sortOrder: variant?.sort_order ?? 0,
      isActive: variant?.is_active ?? true,
      attributes: Object.entries(variant?.attributes ?? {}).map(([key, value]) => ({
        key,
        value: String(value),
      })),
      initialQuantity: 0,
      lowStockThreshold: 10,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'attributes' })

  const onSubmit = handleSubmit(async (values) => {
    const attributes = Object.fromEntries(
      values.attributes.filter((a) => a.key.trim() !== '').map((a) => [a.key.trim(), a.value])
    )

    try {
      if (isEditMode && variant) {
        await updateMutation.mutateAsync({
          variantId: variant.id,
          input: {
            sku: values.sku,
            name: values.name,
            price: values.price,
            compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : null,
            sortOrder: values.sortOrder,
            isActive: values.isActive,
            attributes,
          },
        })
        toast.success('Variant updated')
      } else {
        await addMutation.mutateAsync({
          sku: values.sku,
          name: values.name,
          price: values.price,
          compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : undefined,
          sortOrder: values.sortOrder,
          attributes,
          initialQuantity: values.initialQuantity,
          lowStockThreshold: values.lowStockThreshold,
        })
        toast.success('Variant added')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
    }
  })

  const isSaving = addMutation.isPending || updateMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? 'Edit variant' : 'Add variant'}
      description={isEditMode ? undefined : 'Creates an inventory record for this variant too.'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">SKU</label>
            <input
              {...register('sku')}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              placeholder="MVG-60CT"
            />
            {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              {...register('name')}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              placeholder="60 Count Bottle"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Price ($)</label>
            <input
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Compare-at ($)</label>
            <input
              type="number"
              step="0.01"
              {...register('compareAtPrice')}
              placeholder="Optional"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Sort order</label>
            <input
              type="number"
              {...register('sortOrder', { valueAsNumber: true })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>

        {!isEditMode && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Initial stock</label>
              <input
                type="number"
                {...register('initialQuantity', { valueAsNumber: true })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Low stock threshold</label>
              <input
                type="number"
                {...register('lowStockThreshold', { valueAsNumber: true })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">Attributes</label>
            <button
              type="button"
              onClick={() => append({ key: '', value: '' })}
              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  {...register(`attributes.${index}.key` as const)}
                  placeholder="count"
                  className="w-1/2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
                <input
                  {...register(`attributes.${index}.value` as const)}
                  placeholder="60"
                  className="w-1/2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {isEditMode && (
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" {...register('isActive')} className="size-4 rounded border-slate-300" />
            Active
          </label>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Save changes' : 'Add variant'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
