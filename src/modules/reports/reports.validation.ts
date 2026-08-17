import { Schema } from '../../common/validation';

export const dateRangeQuerySchema: Schema = {
  dateFrom: { type: 'date', required: false },
  dateTo: { type: 'date', required: false },
};

export const topProductsQuerySchema: Schema = {
  dateFrom: { type: 'date', required: false },
  dateTo: { type: 'date', required: false },
  limit: { type: 'integer', required: false, min: 1, max: 50 },
};
