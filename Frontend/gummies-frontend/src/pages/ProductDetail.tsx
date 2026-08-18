import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useDeleteProductMutation,
  useProductQuery,
  useRemoveVariantMutation,
  useUpdateProductMutation,
} from '@/hooks/useProducts'
import { useCategoriesQuery } from '@/hooks/useCategories'
import { VariantsTable } from '@/components/products/VariantsTable'
import { VariantFormDialog } from '@/components/products/VariantFormDialog'
import { ImagesPanel } from '@/components/products/ImagesPanel'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ApiError } from '@/api/httpClient'
import type { ProductAdminDetail, ProductVariant } from '@/types/product'

const generalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  slug: z.string().max(200).optional(),
  categoryId: z.string().optional(),
  basePrice: z.number().min(0, 'Must be 0 or more'),
  shortDescription: z.string().max(500).optional(),
  description: z.string().max(5000).optional(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(300).optional(),
  isActive: z.boolean(),
})

type GeneralInfoValues = z.infer<typeof generalInfoSchema>

export function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: product, isLoading, isError } = useProductQuery(id ?? '')

  if (isLoading) {
    return (
      <div className="px-6 py-6">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="px-6 py-6">
        <p className="text-sm text-red-600">Failed to load product.</p>
      </div>
    )
  }

  return <ProductDetailContent product={product} />
}

function ProductDetailContent({ product }: { product: ProductAdminDetail }) {
  const navigate = useNavigate()
  const { data: categories = [] } = useCategoriesQuery()

  const updateMutation = useUpdateProductMutation(product.id)
  const deleteMutation = useDeleteProductMutation()
  const removeVariantMutation = useRemoveVariantMutation(product.id)

  const [deleteProductOpen, setDeleteProductOpen] = useState(false)
  const [variantDialog, setVariantDialog] = useState<{ open: boolean; variant?: ProductVariant }>({ open: false })
  const [deleteVariantTarget, setDeleteVariantTarget] = useState<ProductVariant | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GeneralInfoValues>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: toFormValues(product),
  })

  // Keep the form in sync if the product is refetched (e.g. after a save,
  // in case the server normalized anything like the slug).
  useEffect(() => {
    reset(toFormValues(product))
  }, [product, reset])

  const onSubmitGeneralInfo = handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({
        name: values.name,
        slug: values.slug || undefined,
        categoryId: values.categoryId || null,
        basePrice: values.basePrice,
        shortDescription: values.shortDescription || null,
        description: values.description || null,
        metaTitle: values.metaTitle || null,
        metaDescription: values.metaDescription || null,
        isActive: values.isActive,
      })
      toast.success('Product saved')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save product')
    }
  })

  async function handleConfirmDeleteProduct() {
    try {
      await deleteMutation.mutateAsync(product.id)
      toast.success('Product deleted')
      navigate('/products')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete product')
    }
  }

  async function handleConfirmDeleteVariant() {
    if (!deleteVariantTarget) return
    try {
      await removeVariantMutation.mutateAsync(deleteVariantTarget.id)
      toast.success('Variant deleted')
      setDeleteVariantTarget(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete variant')
    }
  }

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

      <div className="mt-2 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">{product.name}</h1>
            <span
              className={[
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                product.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500',
              ].join(' ')}
            >
              {product.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">/{product.slug}</p>
        </div>
        <button
          type="button"
          onClick={() => setDeleteProductOpen(true)}
          className="flex items-center gap-2 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <Trash2 size={16} />
          Delete product
        </button>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">General info</h2>
        <form onSubmit={onSubmitGeneralInfo} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input
                {...register('name')}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Slug</label>
              <input
                {...register('slug')}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
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

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input type="checkbox" {...register('isActive')} className="size-4 rounded border-slate-300" />
            Active
          </label>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Variants</h2>
          <button
            type="button"
            onClick={() => setVariantDialog({ open: true })}
            className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
          >
            <Plus size={14} />
            Add variant
          </button>
        </div>
        <div className="mt-4">
          <VariantsTable
            variants={product.variants}
            onEdit={(variant) => setVariantDialog({ open: true, variant })}
            onDelete={(variant) => setDeleteVariantTarget(variant)}
          />
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Images</h2>
        <div className="mt-4">
          <ImagesPanel productId={product.id} images={product.images} />
        </div>
      </section>

      <VariantFormDialog
        key={variantDialog.variant?.id ?? 'create'}
        open={variantDialog.open}
        onOpenChange={(open) => setVariantDialog((prev) => ({ ...prev, open }))}
        productId={product.id}
        variant={variantDialog.variant}
      />

      <ConfirmDialog
        open={Boolean(deleteVariantTarget)}
        onOpenChange={(open) => !open && setDeleteVariantTarget(null)}
        title="Delete variant"
        description={
          deleteVariantTarget ? `Are you sure you want to delete "${deleteVariantTarget.name}"?` : undefined
        }
        confirmLabel="Delete"
        isLoading={removeVariantMutation.isPending}
        onConfirm={handleConfirmDeleteVariant}
      />

      <ConfirmDialog
        open={deleteProductOpen}
        onOpenChange={setDeleteProductOpen}
        title="Delete product"
        description={`Are you sure you want to delete "${product.name}"? This also deletes its variants and images. This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDeleteProduct}
      />
    </div>
  )
}

function toFormValues(product: ProductAdminDetail): GeneralInfoValues {
  return {
    name: product.name,
    slug: product.slug,
    categoryId: product.category_id ?? '',
    basePrice: Number(product.base_price),
    shortDescription: product.short_description ?? '',
    description: product.description ?? '',
    metaTitle: product.meta_title ?? '',
    metaDescription: product.meta_description ?? '',
    isActive: product.is_active,
  }
}
