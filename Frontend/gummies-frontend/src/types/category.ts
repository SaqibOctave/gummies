export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_id: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CategoryInput {
  name: string
  slug?: string
  description?: string
  imageId?: string | null
  parentId?: string | null
  sortOrder?: number
  isActive?: boolean
}
