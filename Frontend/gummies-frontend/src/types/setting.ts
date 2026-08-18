export type SettingsMap = Record<string, unknown>

export interface SettingFieldMeta {
  key: string
  label: string
  description?: string
  type: 'text' | 'number' | 'email'
}

// The only keys the backend seeds/relies on (checkout pricing reads these
// directly) - rendered as a proper typed form. Any other key found in the
// settings table falls back to a raw JSON editor so nothing is hidden.
export const KNOWN_SETTINGS: SettingFieldMeta[] = [
  { key: 'store_name', label: 'Store name', type: 'text' },
  { key: 'store_currency', label: 'Currency code', type: 'text', description: 'ISO 4217 code, e.g. USD' },
  {
    key: 'flat_shipping_rate',
    label: 'Flat shipping rate',
    type: 'number',
    description: 'Charged per order unless the free-shipping threshold is met',
  },
  {
    key: 'free_shipping_threshold',
    label: 'Free shipping threshold',
    type: 'number',
    description: 'Order subtotal at or above which shipping is free',
  },
  { key: 'tax_rate_percent', label: 'Tax rate (%)', type: 'number' },
  { key: 'contact_email', label: 'Support contact email', type: 'email' },
]
