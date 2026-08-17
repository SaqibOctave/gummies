export type FieldType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'email'
  | 'uuid'
  | 'array'
  | 'object'
  | 'enum'
  | 'date';

export interface FieldRule {
  type: FieldType;
  required?: boolean;
  min?: number; // string length / number value / array length
  max?: number; // string length / number value / array length
  pattern?: RegExp;
  enumValues?: readonly string[];
  itemType?: FieldType; // for arrays of primitives
  nullable?: boolean;
}

export type Schema = Record<string, FieldRule>;

export interface FieldError {
  field: string;
  message: string;
}
