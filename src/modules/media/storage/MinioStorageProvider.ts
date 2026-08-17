import { Client as MinioClient } from 'minio';
import crypto from 'crypto';
import path from 'path';
import { env } from '../../../config/env';
import { logger } from '../../../common/utils/logger';
import { StorageProvider, UploadInput, UploadResult } from './StorageProvider';

export class MinioStorageProvider implements StorageProvider {
  public readonly driver = 'minio' as const;
  private readonly client: MinioClient;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private bucketReady: Promise<void> | null = null;

  constructor() {
    const config = env.storage.minio;
    this.client = new MinioClient({
      endPoint: config.endpoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl.replace(/\/+$/, '');
  }

  // Bucket creation + public-read policy happen lazily on first use rather
  // than at import time, and are memoized so concurrent uploads only pay
  // the setup cost once per process.
  private async ensureBucket(): Promise<void> {
    if (!this.bucketReady) {
      this.bucketReady = this.initBucket().catch((error) => {
        this.bucketReady = null; // allow retry on next upload if init failed
        throw error;
      });
    }
    return this.bucketReady;
  }

  private async initBucket(): Promise<void> {
    const exists = await this.client.bucketExists(this.bucket).catch(() => false);
    if (!exists) {
      await this.client.makeBucket(this.bucket);
      logger.info(`Created MinIO bucket: ${this.bucket}`);
    }

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucket}/*`],
        },
      ],
    };
    await this.client.setBucketPolicy(this.bucket, JSON.stringify(policy));
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    await this.ensureBucket();

    const ext = path.extname(input.originalName).toLowerCase();
    const storageKey = `${crypto.randomUUID()}${ext}`;

    await this.client.putObject(this.bucket, storageKey, input.buffer, input.buffer.length, {
      'Content-Type': input.mimeType,
    });

    return { storageKey, url: this.getUrl(storageKey) };
  }

  async delete(storageKey: string): Promise<void> {
    await this.client.removeObject(this.bucket, storageKey);
  }

  getUrl(storageKey: string): string {
    return `${this.publicUrl}/${this.bucket}/${storageKey}`;
  }
}
