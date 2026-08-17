import { Schema } from '../../common/validation';

export const restockSchema: Schema = {
  quantity: { type: 'integer', required: true, min: 1 },
  note: { type: 'string', required: false, max: 500 },
};

export const adjustSchema: Schema = {
  delta: { type: 'integer', required: true },
  note: { type: 'string', required: false, max: 500 },
};

export const thresholdSchema: Schema = {
  threshold: { type: 'integer', required: true, min: 0 },
};

export const variantIdParamSchema: Schema = {
  variantId: { type: 'uuid', required: true },
};

export const listInventoryQuerySchema: Schema = {
  page: { type: 'integer', required: false, min: 1 },
  limit: { type: 'integer', required: false, min: 1, max: 100 },
  lowStockOnly: { type: 'boolean', required: false },
};
