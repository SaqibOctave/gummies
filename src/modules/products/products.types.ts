export interface ProductRecord {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  base_price: string;
  meta_title: string | null;
  meta_description: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// The shape products.repository.list() actually returns: each row gets its
// primary (or first) image joined in, since a customer-facing product grid
// needs a thumbnail without an N+1 request per card.
export interface ProductListItem extends ProductRecord {
  primary_image_url: string | null;
  primary_image_alt: string | null;
  in_stock: boolean;
}

export interface ProductVariantRecord {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  price: string;
  compare_at_price: string | null;
  attributes: Record<string, unknown>;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface VariantWithAvailability extends ProductVariantRecord {
  quantity_on_hand: number;
  quantity_reserved: number;
  available_quantity: number;
}

export interface ProductImageRecord {
  id: string;
  product_id: string;
  media_id: string;
  sort_order: number;
  is_primary: boolean;
  created_at: Date;
  url?: string;
  alt_text?: string | null;
}
