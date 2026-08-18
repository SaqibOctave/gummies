export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_id: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// The shape categoriesRepository.list() actually returns: the category's own
// image resolved to a URL, since a customer-facing category grid needs a
// thumbnail without an N+1 request per card.
export interface CategoryListItem extends CategoryRecord {
  image_url: string | null;
  image_alt_text: string | null;
}
