CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL UNIQUE REFERENCES product_variants (id) ON DELETE CASCADE,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_inventory_updated_at
BEFORE UPDATE ON inventory
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Append-only ledger of every stock change for auditability.
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants (id) ON DELETE CASCADE,
  change_quantity INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (
    reason IN ('restock', 'manual_adjustment', 'order_reserved', 'order_released', 'order_fulfilled', 'correction')
  ),
  reference_type TEXT,
  reference_id UUID,
  note TEXT,
  created_by UUID REFERENCES admins (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_movements_variant_id ON inventory_movements (variant_id);
CREATE INDEX idx_inventory_movements_reference ON inventory_movements (reference_type, reference_id);
