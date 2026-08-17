export interface UploadInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export interface UploadResult {
  storageKey: string;
  url: string;
}

// Any storage backend (local disk today, MinIO/S3 later) implements this.
// Business logic in the media module only depends on this interface, never
// on a concrete provider, so swapping providers requires no service changes.
export interface StorageProvider {
  readonly driver: 'local' | 'minio';
  upload(input: UploadInput): Promise<UploadResult>;
  delete(storageKey: string): Promise<void>;
  getUrl(storageKey: string): string;
}
