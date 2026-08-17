import { Schema } from '../../common/validation';
import { HOMEPAGE_BLOCK_TYPES } from './homepage.types';

export const createHomepageBlockSchema: Schema = {
  type: { type: 'enum', required: true, enumValues: HOMEPAGE_BLOCK_TYPES },
  title: { type: 'string', required: false, max: 200 },
  config: { type: 'object', required: false },
  sortOrder: { type: 'integer', required: false, min: 0 },
  startsAt: { type: 'date', required: false },
  endsAt: { type: 'date', required: false },
};

export const updateHomepageBlockSchema: Schema = {
  title: { type: 'string', required: false, max: 200, nullable: true },
  config: { type: 'object', required: false },
  sortOrder: { type: 'integer', required: false, min: 0 },
  isActive: { type: 'boolean', required: false },
  startsAt: { type: 'date', required: false, nullable: true },
  endsAt: { type: 'date', required: false, nullable: true },
};

export const homepageBlockIdParamSchema: Schema = {
  id: { type: 'uuid', required: true },
};
