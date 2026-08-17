import { Schema } from '../../common/validation';

export const settingKeyParamSchema: Schema = {
  key: { type: 'string', required: true, min: 1, max: 100, pattern: /^[a-z0-9_]+$/ },
};
