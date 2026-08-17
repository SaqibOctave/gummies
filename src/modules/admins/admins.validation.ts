import { Schema } from '../../common/validation';
import { ADMIN_ROLES } from '../../common/constants/roles';

export const createAdminSchema: Schema = {
  name: { type: 'string', required: true, min: 2, max: 120 },
  email: { type: 'email', required: true },
  password: { type: 'string', required: true, min: 8, max: 128 },
  role: { type: 'enum', required: true, enumValues: ADMIN_ROLES },
};

export const updateAdminSchema: Schema = {
  name: { type: 'string', required: false, min: 2, max: 120 },
  role: { type: 'enum', required: false, enumValues: ADMIN_ROLES },
  isActive: { type: 'boolean', required: false },
  password: { type: 'string', required: false, min: 8, max: 128 },
};

export const adminIdParamSchema: Schema = {
  id: { type: 'uuid', required: true },
};

export const listAdminsQuerySchema: Schema = {
  page: { type: 'integer', required: false, min: 1 },
  limit: { type: 'integer', required: false, min: 1, max: 100 },
};
