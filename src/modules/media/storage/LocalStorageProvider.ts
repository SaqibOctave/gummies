import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { env } from '../../../config/env';
import { StorageProvider, UploadInput, UploadResult } from './StorageProvider';

export class LocalStorageProvider implements StorageProvider {
  public readonly driver = 'local' as const;
  private readonly uploadDir: string;
  private readonly publicPath: string;

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), env.storage.localUploadDir);
    this.publicPath = env.storage.localPublicPath;
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    await fs.mkdir(this.uploadDir, { recursive: true });

    const ext = path.extname(input.originalName).toLowerCase();
    const storageKey = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(this.uploadDir, storageKey);

    await fs.writeFile(filePath, input.buffer);

    return { storageKey, url: this.getUrl(storageKey) };
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = path.join(this.uploadDir, storageKey);
    await fs.rm(filePath, { force: true });
  }

  getUrl(storageKey: string): string {
    return `${env.appUrl}${this.publicPath}/${storageKey}`;
  }
}
