import { Schema } from '../../common/validation';

export const loginSchema: Schema = {
  email: { type: 'email', required: true },
  password: { type: 'string', required: true, min: 1, max: 128 },
};
