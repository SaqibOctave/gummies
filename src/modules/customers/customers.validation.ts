import { Schema } from '../../common/validation';

export const listCustomersQuerySchema: Schema = {
  page: { type: 'integer', required: false, min: 1 },
  limit: { type: 'integer', required: false, min: 1, max: 100 },
  search: { type: 'string', required: false, max: 200 },
};

export const customerIdParamSchema: Schema = {
  id: { type: 'uuid', required: true },
};
