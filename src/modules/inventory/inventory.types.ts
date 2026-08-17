export interface InventoryRecord {
  id: string;
  variant_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  low_stock_threshold: number;
  updated_at: Date;
}

export interface InventoryWithProductInfo extends InventoryRecord {
  sku: string;
  variant_name: string;
  product_id: string;
  product_name: string;
}

export type InventoryMovementReason =
  | 'restock'
  | 'manual_adjustment'
  | 'order_reserved'
  | 'order_released'
  | 'order_fulfilled'
  | 'correction';

export interface InventoryMovementRecord {
  id: string;
  variant_id: string;
  change_quantity: number;
  reason: InventoryMovementReason;
  reference_type: string | null;
  reference_id: string | null;
  note: string | null;
  created_by: string | null;
  created_at: Date;
}
