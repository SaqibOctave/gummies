import { Schema } from '../../common/validation';

export const createProductSchema: Schema = {
  categoryId: { type: 'uuid', required: false },
  name: { type: 'string', required: true, min: 2, max: 200 },
  slug: { type: 'string', required: false, min: 2, max: 200 },
  description: { type: 'string', required: false, max: 5000 },
  shortDescription: { type: 'string', required: false, max: 500 },
  basePrice: { type: 'number', required: true, min: 0 },
  metaTitle: { type: 'string', required: false, max: 200 },
  metaDescription: { type: 'string', required: false, max: 300 },
};

export const updateProductSchema: Schema = {
  categoryId: { type: 'uuid', required: false, nullable: true },
  name: { type: 'string', required: false, min: 2, max: 200 },
  slug: { type: 'string', required: false, min: 2, max: 200 },
  description: { type: 'string', required: false, max: 5000, nullable: true },
  shortDescription: { type: 'string', required: false, max: 500, nullable: true },
  basePrice: { type: 'number', required: false, min: 0 },
  metaTitle: { type: 'string', required: false, max: 200, nullable: true },
  metaDescription: { type: 'string', required: false, max: 300, nullable: true },
  isActive: { type: 'boolean', required: false },
};

export const productIdParamSchema: Schema = {
  id: { type: 'uuid', required: true },
};

export const productSlugParamSchema: Schema = {
  slug: { type: 'string', required: true },
};

export const listProductsQuerySchema: Schema = {
  page: { type: 'integer', required: false, min: 1 },
  limit: { type: 'integer', required: false, min: 1, max: 100 },
  categoryId: { type: 'uuid', required: false },
  search: { type: 'string', required: false, max: 200 },
  sort: {
    type: 'enum',
    required: false,
    enumValues: ['newest', 'price_asc', 'price_desc', 'name_asc', 'best_selling'],
  },
};

export const createVariantSchema: Schema = {
  sku: { type: 'string', required: true, min: 1, max: 64 },
  name: { type: 'string', required: true, min: 1, max: 150 },
  price: { type: 'number', required: true, min: 0 },
  compareAtPrice: { type: 'number', required: false, min: 0 },
  attributes: { type: 'object', required: false },
  sortOrder: { type: 'integer', required: false, min: 0 },
  initialQuantity: { type: 'integer', required: false, min: 0 },
  lowStockThreshold: { type: 'integer', required: false, min: 0 },
};

export const updateVariantSchema: Schema = {
  sku: { type: 'string', required: false, min: 1, max: 64 },
  name: { type: 'string', required: false, min: 1, max: 150 },
  price: { type: 'number', required: false, min: 0 },
  compareAtPrice: { type: 'number', required: false, min: 0, nullable: true },
  attributes: { type: 'object', required: false },
  isActive: { type: 'boolean', required: false },
  sortOrder: { type: 'integer', required: false, min: 0 },
};

export const variantIdParamSchema: Schema = {
  variantId: { type: 'uuid', required: true },
};

export const attachImageSchema: Schema = {
  mediaId: { type: 'uuid', required: true },
  isPrimary: { type: 'boolean', required: false },
  sortOrder: { type: 'integer', required: false, min: 0 },
};

export const imageIdParamSchema: Schema = {
  imageId: { type: 'uuid', required: true },
};
