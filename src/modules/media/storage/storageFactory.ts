import { env } from '../../../config/env';
import { StorageProvider } from './StorageProvider';
import { LocalStorageProvider } from './LocalStorageProvider';
import { MinioStorageProvider } from './MinioStorageProvider';

let cachedProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (cachedProvider) return cachedProvider;

  switch (env.storage.driver) {
    case 'local':
      cachedProvider = new LocalStorageProvider();
      return cachedProvider;
    case 'minio':
      cachedProvider = new MinioStorageProvider();
      return cachedProvider;
    default:
      throw new Error(`Unknown storage driver: ${env.storage.driver}`);
  }
}
