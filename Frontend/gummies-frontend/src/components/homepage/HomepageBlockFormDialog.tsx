import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { toast } from 'sonner'
import { Dialog } from '@/components/ui/Dialog'
import { MultiSelectList } from '@/components/ui/MultiSelectList'
import { useCreateHomepageBlockMutation, useUpdateHomepageBlockMutation } from '@/hooks/useHomepage'
import { useProductsQuery } from '@/hooks/useProducts'
import { useCategoriesQuery } from '@/hooks/useCategories'
import * as mediaApi from '@/api/media'
import { ApiError } from '@/api/httpClient'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/lib/format'
import { HOMEPAGE_BLOCK_TYPES, HOMEPAGE_BLOCK_TYPE_LABEL } from '@/types/homepage'
import type { HeroBannerConfig, HomepageBlock, HomepageBlockType, PromoBannerConfig } from '@/types/homepage'

interface HomepageBlockFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  block?: HomepageBlock
}

export function HomepageBlockFormDialog({ open, onOpenChange, block }: HomepageBlockFormDialogProps) {
  const isEditMode = Boolean(block)
  const createMutation = useCreateHomepageBlockMutation()
  const updateMutation = useUpdateHomepageBlockMutation()

  const [type, setType] = useState<HomepageBlockType>(block?.type ?? 'hero_banner')
  const [title, setTitle] = useState(block?.title ?? '')
  const [sortOrder, setSortOrder] = useState(block?.sort_order ?? 0)
  const [isActive, setIsActive] = useState(block?.is_active ?? true)
  const [startsAt, setStartsAt] = useState(toDatetimeLocalValue(block?.starts_at))
  const [endsAt, setEndsAt] = useState(toDatetimeLocalValue(block?.ends_at))

  const initialConfig = (block?.config ?? {}) as Record<string, unknown>
  const [hero, setHero] = useState<HeroBannerConfig>({
    headline: (initialConfig.headline as string) ?? '',
    subheadline: (initialConfig.subheadline as string) ?? '',
    imageId: initialConfig.imageId as string | undefined,
    imageUrl: initialConfig.imageUrl as string | undefined,
    ctaText: (initialConfig.ctaText as string) ?? '',
    ctaUrl: (initialConfig.ctaUrl as string) ?? '',
  })
  const [promo, setPromo] = useState<PromoBannerConfig>({
    text: (initialConfig.text as string) ?? '',
    ctaText: (initialConfig.ctaText as string) ?? '',
    ctaUrl: (initialConfig.ctaUrl as string) ?? '',
  })
  const [featuredProductIds, setFeaturedProductIds] = useState<string[]>(
    (initialConfig.productIds as string[]) ?? []
  )
  const [categoryGridIds, setCategoryGridIds] = useState<string[]>((initialConfig.categoryIds as string[]) ?? [])
  const [richTextContent, setRichTextContent] = useState((initialConfig.content as string) ?? '')

  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const { data: productsPage } = useProductsQuery({ page: 1, limit: 100 })
  const { data: categories = [] } = useCategoriesQuery()

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingImage(true)
    try {
      const media = await mediaApi.upload(file)
      setHero((prev) => ({ ...prev, imageId: media.id, imageUrl: media.url }))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  function buildConfig(): Record<string, unknown> {
    switch (type) {
      case 'hero_banner':
        return { ...hero }
      case 'promo_banner':
        return { ...promo }
      case 'featured_products':
        return { productIds: featuredProductIds }
      case 'category_grid':
        return { categoryIds: categoryGridIds }
      case 'rich_text':
        return { content: richTextContent }
      default:
        return {}
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const input = {
      title: title || null,
      config: buildConfig(),
      sortOrder,
      startsAt: fromDatetimeLocalValue(startsAt) ?? null,
      endsAt: fromDatetimeLocalValue(endsAt) ?? null,
      ...(isEditMode ? { isActive } : {}),
    }

    try {
      if (isEditMode && block) {
        await updateMutation.mutateAsync({ id: block.id, input })
        toast.success('Block updated')
      } else {
        await createMutation.mutateAsync({ type, ...input })
        toast.success('Block created')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending
  const inputClass =
    'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500'

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={isEditMode ? 'Edit block' : 'Add block'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Type</label>
            {isEditMode ? (
              <p className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {HOMEPAGE_BLOCK_TYPE_LABEL[type]}
              </p>
            ) : (
              <select
                value={type}
                onChange={(e) => setType(e.target.value as HomepageBlockType)}
                className={`mt-1 bg-white ${inputClass}`}
              >
                {HOMEPAGE_BLOCK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {HOMEPAGE_BLOCK_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Title (internal)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Sale banner"
              className={`mt-1 ${inputClass}`}
            />
          </div>
        </div>

        <div className="rounded-md border border-slate-200 p-3">
          <h3 className="text-sm font-semibold text-slate-900">{HOMEPAGE_BLOCK_TYPE_LABEL[type]} content</h3>
          <div className="mt-3">
            {type === 'hero_banner' && (
              <div className="space-y-3">
                <input
                  value={hero.headline}
                  onChange={(e) => setHero((p) => ({ ...p, headline: e.target.value }))}
                  placeholder="Headline"
                  className={inputClass}
                />
                <input
                  value={hero.subheadline}
                  onChange={(e) => setHero((p) => ({ ...p, subheadline: e.target.value }))}
                  placeholder="Subheadline (optional)"
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={hero.ctaText}
                    onChange={(e) => setHero((p) => ({ ...p, ctaText: e.target.value }))}
                    placeholder="Button text"
                    className={inputClass}
                  />
                  <input
                    value={hero.ctaUrl}
                    onChange={(e) => setHero((p) => ({ ...p, ctaUrl: e.target.value }))}
                    placeholder="Button link (e.g. /products)"
                    className={inputClass}
                  />
                </div>
                <div className="flex items-center gap-3">
                  {hero.imageUrl && (
                    <img
                      src={hero.imageUrl}
                      alt=""
                      className="size-14 shrink-0 rounded-md border border-slate-200 object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUploadingImage}
                    className="text-sm text-slate-600"
                  />
                  {isUploadingImage && <span className="text-xs text-slate-500">Uploading...</span>}
                </div>
              </div>
            )}

            {type === 'promo_banner' && (
              <div className="space-y-3">
                <input
                  value={promo.text}
                  onChange={(e) => setPromo((p) => ({ ...p, text: e.target.value }))}
                  placeholder="Promo text"
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={promo.ctaText}
                    onChange={(e) => setPromo((p) => ({ ...p, ctaText: e.target.value }))}
                    placeholder="Button text"
                    className={inputClass}
                  />
                  <input
                    value={promo.ctaUrl}
                    onChange={(e) => setPromo((p) => ({ ...p, ctaUrl: e.target.value }))}
                    placeholder="Button link"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {type === 'featured_products' && (
              <MultiSelectList
                options={(productsPage?.data ?? []).map((p) => ({ id: p.id, label: p.name }))}
                selectedIds={featuredProductIds}
                onChange={setFeaturedProductIds}
                emptyLabel="No products yet."
              />
            )}

            {type === 'category_grid' && (
              <MultiSelectList
                options={categories.map((c) => ({ id: c.id, label: c.name }))}
                selectedIds={categoryGridIds}
                onChange={setCategoryGridIds}
                emptyLabel="No categories yet."
              />
            )}

            {type === 'rich_text' && (
              <textarea
                value={richTextContent}
                onChange={(e) => setRichTextContent(e.target.value)}
                rows={5}
                placeholder="Content shown on the homepage"
                className={inputClass}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Sort order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className={`mt-1 ${inputClass}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Starts (optional)</label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Ends (optional)</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </div>
        </div>

        {isEditMode && (
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="size-4 rounded border-slate-300"
            />
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
            {isSaving ? 'Saving...' : isEditMode ? 'Save changes' : 'Create block'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
