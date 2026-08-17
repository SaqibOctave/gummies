export const HOMEPAGE_BLOCK_TYPES = [
  'hero_banner',
  'promo_banner',
  'featured_products',
  'category_grid',
  'rich_text',
] as const;

export type HomepageBlockType = (typeof HOMEPAGE_BLOCK_TYPES)[number];

export interface HomepageBlockRecord {
  id: string;
  type: HomepageBlockType;
  title: string | null;
  config: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
  starts_at: Date | null;
  ends_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
