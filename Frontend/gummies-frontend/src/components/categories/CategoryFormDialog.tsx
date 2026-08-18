import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Dialog } from '@/components/ui/Dialog'
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '@/hooks/useCategories'
import * as mediaApi from '@/api/media'
import { ApiError } from '@/api/httpClient'
import type { Category } from '@/types/category'

const categoryFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150),
  slug: z.string().max(150).optional(),
  description: z.string().max(2000).optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int('Must be a whole number').min(0, 'Must be 0 or more'),
  isActive: z.boolean(),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category
  categories: Category[]
}

export function CategoryFormDialog({ open, onOpenChange, category, categories }: CategoryFormDialogProps) {
  const isEditMode = Boolean(category)
  const createMutation = useCreateCategoryMutation()
  const updateMutation = useUpdateCategoryMutation()

  const existingImageQuery = useQuery({
    queryKey: ['media', category?.image_id],
    queryFn: () => mediaApi.getById(category!.image_id as string),
    enabled: Boolean(category?.image_id),
  })

  const [uploadedImage, setUploadedImage] = useState<{ id: string; url: string } | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const currentImageUrl = uploadedImage?.url ?? existingImageQuery.data?.url ?? null
  const currentImageId = uploadedImage?.id ?? category?.image_id ?? null

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? '',
      slug: category?.slug ?? '',
      description: category?.description ?? '',
      parentId: category?.parent_id ?? '',
      sortOrder: category?.sort_order ?? 0,
      isActive: category?.is_active ?? true,
    },
  })

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    try {
      const media = await mediaApi.upload(file)
      setUploadedImage({ id: media.id, url: media.url })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    const input = {
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || undefined,
      parentId: values.parentId || undefined,
      sortOrder: values.sortOrder,
      imageId: currentImageId,
      ...(isEditMode ? { isActive: values.isActive } : {}),
    }

    try {
      if (isEditMode && category) {
        await updateMutation.mutateAsync({ id: category.id, input })
        toast.success('Category updated')
      } else {
        await createMutation.mutateAsync(input)
        toast.success('Category created')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
    }
  })

  const isSaving = createMutation.isPending || updateMutation.isPending
  const parentOptions = categories.filter((c) => c.id !== category?.id)

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? 'Edit category' : 'Add category'}
      description={isEditMode ? "Update this category's details." : 'Create a new product category.'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            {...register('name')}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            placeholder="Vitamin Gummies"
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

        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Parent category</label>
            <select
              {...register('parentId')}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            >
              <option value="">None</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Sort order</label>
            <input
              type="number"
              {...register('sortOrder', { valueAsNumber: true })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
            {errors.sortOrder && <p className="mt-1 text-xs text-red-600">{errors.sortOrder.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Image</label>
          <div className="mt-1 flex items-center gap-3">
            {currentImageUrl && (
              <img
                src={currentImageUrl}
                alt=""
                className="size-12 shrink-0 rounded-md border border-slate-200 object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploadingImage}
              className="text-sm text-slate-600"
            />
          </div>
          {isUploadingImage && <p className="mt-1 text-xs text-slate-500">Uploading...</p>}
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
            disabled={isSaving || isUploadingImage}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Save changes' : 'Create category'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
