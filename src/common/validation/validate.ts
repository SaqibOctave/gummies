import { FieldError, FieldRule, Schema } from './types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function checkPrimitive(
  field: string,
  rule: FieldRule,
  value: unknown,
  errors: FieldError[]
): unknown {
  switch (rule.type) {
    case 'string': {
      if (typeof value !== 'string') {
        errors.push({ field, message: `${field} must be a string` });
        return value;
      }
      if (rule.min !== undefined && value.length < rule.min) {
        errors.push({ field, message: `${field} must be at least ${rule.min} characters` });
      }
      if (rule.max !== undefined && value.length > rule.max) {
        errors.push({ field, message: `${field} must be at most ${rule.max} characters` });
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push({ field, message: `${field} has an invalid format` });
      }
      return value;
    }
    case 'email': {
      if (typeof value !== 'string' || !EMAIL_RE.test(value)) {
        errors.push({ field, message: `${field} must be a valid email address` });
      }
      return typeof value === 'string' ? value.toLowerCase().trim() : value;
    }
    case 'uuid': {
      if (typeof value !== 'string' || !UUID_RE.test(value)) {
        errors.push({ field, message: `${field} must be a valid UUID` });
      }
      return value;
    }
    case 'number': {
      const num = typeof value === 'number' ? value : Number(value);
      if (typeof value !== 'number' && (value === '' || Number.isNaN(num))) {
        errors.push({ field, message: `${field} must be a number` });
        return value;
      }
      if (rule.min !== undefined && num < rule.min) {
        errors.push({ field, message: `${field} must be >= ${rule.min}` });
      }
      if (rule.max !== undefined && num > rule.max) {
        errors.push({ field, message: `${field} must be <= ${rule.max}` });
      }
      return num;
    }
    case 'integer': {
      const num = typeof value === 'number' ? value : Number(value);
      if (Number.isNaN(num) || !Number.isInteger(num)) {
        errors.push({ field, message: `${field} must be an integer` });
        return value;
      }
      if (rule.min !== undefined && num < rule.min) {
        errors.push({ field, message: `${field} must be >= ${rule.min}` });
      }
      if (rule.max !== undefined && num > rule.max) {
        errors.push({ field, message: `${field} must be <= ${rule.max}` });
      }
      return num;
    }
    case 'boolean': {
      if (typeof value === 'boolean') return value;
      if (value === 'true') return true;
      if (value === 'false') return false;
      errors.push({ field, message: `${field} must be a boolean` });
      return value;
    }
    case 'date': {
      const date = new Date(value as string);
      if (Number.isNaN(date.getTime())) {
        errors.push({ field, message: `${field} must be a valid date` });
        return value;
      }
      return date.toISOString();
    }
    case 'enum': {
      if (typeof value !== 'string' || !rule.enumValues?.includes(value)) {
        errors.push({
          field,
          message: `${field} must be one of: ${rule.enumValues?.join(', ')}`,
        });
      }
      return value;
    }
    case 'array': {
      if (!Array.isArray(value)) {
        errors.push({ field, message: `${field} must be an array` });
        return value;
      }
      if (rule.min !== undefined && value.length < rule.min) {
        errors.push({ field, message: `${field} must have at least ${rule.min} item(s)` });
      }
      if (rule.max !== undefined && value.length > rule.max) {
        errors.push({ field, message: `${field} must have at most ${rule.max} item(s)` });
      }
      if (rule.itemType) {
        return value.map((item, idx) =>
          checkPrimitive(`${field}[${idx}]`, { type: rule.itemType as never }, item, errors)
        );
      }
      return value;
    }
    case 'object': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errors.push({ field, message: `${field} must be an object` });
      }
      return value;
    }
    default:
      return value;
  }
}

export function runValidation<T = Record<string, unknown>>(
  schema: Schema,
  input: Record<string, unknown>
): { valid: boolean; errors: FieldError[]; data: T } {
  const errors: FieldError[] = [];
  const output: Record<string, unknown> = { ...input };

  for (const [field, rule] of Object.entries(schema)) {
    const value = input?.[field];
    const isMissing = value === undefined || value === null || value === '';

    if (isMissing) {
      if (rule.required) {
        errors.push({ field, message: `${field} is required` });
      } else if (value === null && rule.nullable) {
        output[field] = null;
      }
      continue;
    }

    output[field] = checkPrimitive(field, rule, value, errors);
  }

  return { valid: errors.length === 0, errors, data: output as T };
}
