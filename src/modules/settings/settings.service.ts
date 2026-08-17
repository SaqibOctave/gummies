import { settingsRepository } from './settings.repository';
import { PUBLIC_SETTING_KEYS } from './settings.types';

function toMap(records: { key: string; value: unknown }[]): Record<string, unknown> {
  return Object.fromEntries(records.map((r) => [r.key, r.value]));
}

export const settingsService = {
  async list(): Promise<Record<string, unknown>> {
    const records = await settingsRepository.list();
    return toMap(records);
  },

  async getPublic(): Promise<Record<string, unknown>> {
    const records = await settingsRepository.findByKeys(PUBLIC_SETTING_KEYS);
    return toMap(records);
  },

  async get(key: string): Promise<unknown> {
    const record = await settingsRepository.findByKey(key);
    return record?.value;
  },

  async set(key: string, value: unknown, adminId: string) {
    return settingsRepository.upsert(key, value, adminId);
  },

  // Used internally by the orders module to price shipping/tax.
  async getCheckoutSettings(): Promise<{
    flatShippingRate: number;
    freeShippingThreshold: number;
    taxRatePercent: number;
    currency: string;
  }> {
    const records = await settingsRepository.findByKeys([
      'flat_shipping_rate',
      'free_shipping_threshold',
      'tax_rate_percent',
      'store_currency',
    ]);
    const map = toMap(records);
    return {
      flatShippingRate: Number(map.flat_shipping_rate ?? 0),
      freeShippingThreshold: Number(map.free_shipping_threshold ?? 0),
      taxRatePercent: Number(map.tax_rate_percent ?? 0),
      currency: (map.store_currency as string) ?? 'USD',
    };
  },
};
