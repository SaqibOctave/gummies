import { Schema } from '../../common/validation';

export const uploadMediaSchema: Schema = {
  altText: { type: 'string', required: false, max: 255 },
};

export const listMediaQuerySchema: Schema = {
  page: { type: 'integer', required: false, min: 1 },
  limit: { type: 'integer', required: false, min: 1, max: 100 },
};

export const mediaIdParamSchema: Schema = {
  id: { type: 'uuid', required: true },
};
