export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_id: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
  image_url: string | null
  image_alt_text: string | null
}
