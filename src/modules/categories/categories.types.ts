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
