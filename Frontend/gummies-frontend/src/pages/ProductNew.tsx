import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateProductMutation } from '@/hooks/useProducts'
import { useCategoriesQuery } from '@/hooks/useCategories'
import { ApiError } from '@/api/httpClient'

const generalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  slug: z.string().max(200).optional(),
  categoryId: z.string().optional(),
  basePrice: z.number().min(0, 'Must be 0 or more'),
  shortDescription: z.string().max(500).optional(),
  description: z.string().max(5000).optional(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(300).optional(),
})

type GeneralInfoValues = z.infer<typeof generalInfoSchema>

export function ProductNew() {
  const navigate = useNavigate()
  const { data: categories = [] } = useCategoriesQuery()
  const createMutation = useCreateProductMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneralInfoValues>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: {
      name: '',
      slug: '',
      categoryId: '',
      basePrice: 0,
      shortDescription: '',
      description: '',
      metaTitle: '',
      metaDescription: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      const product = await createMutation.mutateAsync({
        name: values.name,
        slug: values.slug || undefined,
        categoryId: values.categoryId || undefined,
        basePrice: values.basePrice,
        shortDescription: values.shortDescription || undefined,
        description: values.description || undefined,
        metaTitle: values.metaTitle || undefined,
        metaDescription: values.metaDescription || undefined,
      })
      toast.success('Product created - now add variants and images')
      navigate(`/products/${product.id}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create product')
    }
  })

  return (
    <div className="px-6 py-6">
      <button
        type="button"
        onClick={() => navigate('/products')}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={14} />
        Back to products
      </button>

      <div className="mt-2">
        <h1 className="text-xl font-semibold text-slate-900">Add product</h1>
        <p className="mt-1 text-sm text-slate-500">
          Fill in the product details, then save to unlock variants and images.
        </p>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">General info</h2>
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-slate-700">Slug</label>
              <input
                {...register('slug')}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                placeholder="Auto-generated from name if left blank"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Short description</label>
            <input
              {...register('shortDescription')}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Meta title</label>
              <input
                {...register('metaTitle')}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Meta description</label>
              <input
                {...register('metaDescription')}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMutation.isPending ? 'Creating...' : 'Create product'}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
        <h2 className="text-sm font-semibold text-slate-500">Variants</h2>
        <p className="mt-2 text-sm text-slate-500">Save the product first - you'll add variants here next.</p>
      </section>

      <section className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
        <h2 className="text-sm font-semibold text-slate-500">Images</h2>
        <p className="mt-2 text-sm text-slate-500">Save the product first - you'll add images here next.</p>
      </section>
    </div>
  )
}
