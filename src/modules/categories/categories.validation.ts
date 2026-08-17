import { Schema } from '../../common/validation';

export const createCategorySchema: Schema = {
  name: { type: 'string', required: true, min: 2, max: 150 },
  slug: { type: 'string', required: false, min: 2, max: 150 },
  description: { type: 'string', required: false, max: 2000 },
  imageId: { type: 'uuid', required: false },
  parentId: { type: 'uuid', required: false },
  sortOrder: { type: 'integer', required: false, min: 0 },
};

export const updateCategorySchema: Schema = {
  name: { type: 'string', required: false, min: 2, max: 150 },
  slug: { type: 'string', required: false, min: 2, max: 150 },
  description: { type: 'string', required: false, max: 2000, nullable: true },
  imageId: { type: 'uuid', required: false, nullable: true },
  parentId: { type: 'uuid', required: false, nullable: true },
  sortOrder: { type: 'integer', required: false, min: 0 },
  isActive: { type: 'boolean', required: false },
};

export const categoryIdParamSchema: Schema = {
  id: { type: 'uuid', required: true },
};

export const categorySlugParamSchema: Schema = {
  slug: { type: 'string', required: true },
};

export const listCategoriesQuerySchema: Schema = {
  activeOnly: { type: 'boolean', required: false },
};
