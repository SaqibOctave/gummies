import { Schema } from '../../common/validation';
import { ValidationError } from '../../common/errors';
import { Address, CreateOrderItemInput } from './orders.types';
import { ORDER_STATUSES } from '../../common/constants/orderStatus';

export const createOrderSchema: Schema = {
  contactName: { type: 'string', required: true, min: 2, max: 150 },
  contactEmail: { type: 'email', required: true },
  contactPhone: { type: 'string', required: false, max: 30 },
  shippingAddress: { type: 'object', required: true },
  billingAddress: { type: 'object', required: false },
  customerNotes: { type: 'string', required: false, max: 1000 },
  items: { type: 'array', required: true, min: 1, max: 50 },
};

export const updateOrderStatusSchema: Schema = {
  status: { type: 'enum', required: true, enumValues: ORDER_STATUSES },
  note: { type: 'string', required: false, max: 500 },
};

export const orderIdParamSchema: Schema = {
  id: { type: 'uuid', required: true },
};

export const listOrdersQuerySchema: Schema = {
  page: { type: 'integer', required: false, min: 1 },
  limit: { type: 'integer', required: false, min: 1, max: 100 },
  status: { type: 'enum', required: false, enumValues: ORDER_STATUSES },
  search: { type: 'string', required: false, max: 200 },
};

export const lookupOrderQuerySchema: Schema = {
  email: { type: 'email', required: true },
};

const REQUIRED_ADDRESS_FIELDS: (keyof Address)[] = [
  'fullName',
  'line1',
  'city',
  'state',
  'postalCode',
  'country',
];

export function assertValidAddress(value: unknown, field: string): asserts value is Address {
  if (typeof value !== 'object' || value === null) {
    throw new ValidationError('Validation failed', [{ field, message: `${field} must be an object` }]);
  }
  const address = value as Record<string, unknown>;
  const errors = REQUIRED_ADDRESS_FIELDS.filter(
    (key) => typeof address[key] !== 'string' || (address[key] as string).trim() === ''
  ).map((key) => ({ field: `${field}.${key}`, message: `${field}.${key} is required` }));

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function assertValidItems(value: unknown): asserts value is CreateOrderItemInput[] {
  const items = value as unknown[];
  const errors: { field: string; message: string }[] = [];

  items.forEach((raw, idx) => {
    const item = raw as Record<string, unknown>;
    if (typeof item.variantId !== 'string' || !UUID_RE.test(item.variantId)) {
      errors.push({ field: `items[${idx}].variantId`, message: 'variantId must be a valid UUID' });
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      errors.push({ field: `items[${idx}].quantity`, message: 'quantity must be a positive integer' });
    }
  });

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}
