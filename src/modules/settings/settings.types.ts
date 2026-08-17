export interface SettingRecord {
  key: string;
  value: unknown;
  updated_at: Date;
  updated_by: string | null;
}

export const PUBLIC_SETTING_KEYS = [
  'store_name',
  'store_currency',
  'flat_shipping_rate',
  'free_shipping_threshold',
  'tax_rate_percent',
  'contact_email',
] as const;
