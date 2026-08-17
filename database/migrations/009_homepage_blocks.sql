-- Flexible homepage CMS: each block has a type and a JSON config so new
-- section types can be added without further schema changes.
CREATE TABLE homepage_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (
    type IN ('hero_banner', 'promo_banner', 'featured_products', 'category_grid', 'rich_text')
  ),
  title TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_homepage_blocks_active_sort ON homepage_blocks (is_active, sort_order);

CREATE TRIGGER trg_homepage_blocks_updated_at
BEFORE UPDATE ON homepage_blocks
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
