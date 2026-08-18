import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Dialog } from '@/components/ui/Dialog'
import { useCreateProductMutation } from '@/hooks/useProducts'
import { ApiError } from '@/api/httpClient'
import type { Category } from '@/types/category'

const createProductFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  categoryId: z.string().optional(),
  basePrice: z.number().min(0, 'Must be 0 or more'),
})

type CreateProductFormValues = z.infer<typeof createProductFormSchema>

interface ProductCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
}

// Deliberately minimal: just enough to create the product row, then the
// user lands on its detail page to add variants/images/full description.
export function ProductCreateDialog({ open, onOpenChange, categories }: ProductCreateDialogProps) {
  const navigate = useNavigate()
  const createMutation = useCreateProductMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: { name: '', categoryId: '', basePrice: 0 },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const product = await createMutation.mutateAsync({
        name: values.name,
        categoryId: values.categoryId || undefined,
        basePrice: values.basePrice,
      })
      toast.success('Product created')
      reset()
      onOpenChange(false)
      navigate(`/products/${product.id}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
    }
  })

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add product"
      description="You'll be able to add variants and images on the next screen."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            {...register('name')}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            placeholder="Multivitamin Gummies"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Category</label>
          <select
            {...register('categoryId')}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Base price ($)</label>
          <input
            type="number"
            step="0.01"
            {...register('basePrice', { valueAsNumber: true })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
          {errors.basePrice && <p className="mt-1 text-xs text-red-600">{errors.basePrice.message}</p>}
        </div>

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
            disabled={createMutation.isPending}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMutation.isPending ? 'Creating...' : 'Create product'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
